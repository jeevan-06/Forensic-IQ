
# =============================================================================
# STAGE 4 — PERSON TRACKING
# Algorithm: MOG2 Background Subtraction (gold standard for static CCTV cams)
# + Hair / Skin / Clothing Color Appearance Model
# =============================================================================

class TrackPersonRequest(BaseModel):
    face_id: str
    person_id: str
    face_path: str   # relative path to the selected face crop: "/uploads/faces_.../subject_N.jpg"


# ── Histogram helpers ────────────────────────────────────────────────────────

def _hs_hist(img: np.ndarray, h_bins: int = 18, s_bins: int = 8) -> np.ndarray | None:
    """
    2-D Hue-Saturation histogram normalised to L1.
    18 hue bins × 8 sat bins  =  144 bins total.
    Coarser bins = more robust to lighting changes between frames.
    """
    if img is None or img.size == 0:
        return None
    try:
        hsv  = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        hist = cv2.calcHist([hsv], [0, 1], None, [h_bins, s_bins], [0, 180, 0, 256])
        cv2.normalize(hist, hist, norm_type=cv2.NORM_L1)
        return hist
    except Exception:
        return None


def _corr(a: np.ndarray | None, b: np.ndarray | None) -> float:
    if a is None or b is None:
        return 0.0
    return float(max(0.0, cv2.compareHist(a, b, cv2.HISTCMP_CORREL)))


# ── Build target appearance signature from face crop ─────────────────────────

def _build_signature(face_img: np.ndarray) -> dict:
    """
    Extract 3 colour signatures from the target face crop:
      hair  → top 1/3 of the face image   (most discriminative for back-view CCTV)
      skin  → centre 50% of the face       (identifies skin tone)
      full  → entire face crop             (overall colour profile)
    """
    h, w = face_img.shape[:2]
    hair_zone = face_img[: h // 3, :]
    skin_zone = face_img[h // 4 : 3 * h // 4, w // 5 : 4 * w // 5]
    return {
        "hair": _hs_hist(hair_zone),
        "skin": _hs_hist(skin_zone),
        "full": _hs_hist(face_img),
    }


# ── Score a detected body blob against the target signature ──────────────────

def _score_body(body_crop: np.ndarray, sig: dict) -> float:
    """
    Splits the body region into zones and compares each against the target:
      head zone  (top 20%) ↔ hair signature   — weight 50%
      upper zone (20-50%)  ↔ skin signature   — weight 30%
      full body            ↔ full signature   — weight 20%
    Hair colour is the dominant cue for back-view CCTV tracking.
    """
    if body_crop is None or body_crop.size == 0:
        return 0.0

    body  = cv2.resize(body_crop, (48, 128))
    head  = body[:25, :]        # top ~20% → head / hair
    upper = body[25:64, :]      # 20-50%   → upper clothing / back of head

    hair_score  = _corr(sig["hair"], _hs_hist(head))
    skin_score  = _corr(sig["skin"], _hs_hist(upper))
    color_score = _corr(sig["full"], _hs_hist(body))

    return round(0.50 * hair_score + 0.30 * skin_score + 0.20 * color_score, 4)


# ── MOG2 background subtraction → moving person blobs ────────────────────────

def _apply_mog2(subtractor: cv2.BackgroundSubtractor,
                frame: np.ndarray,
                proc_w: int = 640) -> list[tuple]:
    """
    Apply MOG2 background subtractor to one frame.
    Returns list of (x, y, w, h) bounding boxes in ORIGINAL frame coordinates
    for every person-sized moving blob found.
    """
    scale = proc_w / frame.shape[1]
    small = cv2.resize(frame, (proc_w, int(frame.shape[0] * scale)))

    fg_raw = subtractor.apply(small)

    # Remove shadow pixels (value 127), keep only foreground (255)
    _, fg = cv2.threshold(fg_raw, 200, 255, cv2.THRESH_BINARY)

    # Morphological cleanup: close small holes inside blobs, remove tiny noise
    k_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 15))  # tall kernel
    k_open  = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, k_close)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN,  k_open)
    fg = cv2.dilate(fg, k_open, iterations=2)

    contours, _ = cv2.findContours(fg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    proc_area = proc_w * small.shape[0]
    MIN_AREA  = proc_area * 0.002   # ≥ 0.2% of frame area
    MAX_AREA  = proc_area * 0.25    # ≤ 25% of frame area (skip giant blobs / groups)

    boxes = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if not (MIN_AREA <= area <= MAX_AREA):
            continue
        x, y, w, h = cv2.boundingRect(cnt)
        aspect = h / max(w, 1)
        if aspect < 0.8:            # skip wide blobs (benches, cars, groups side-by-side)
            continue
        # Scale back to original resolution
        boxes.append((
            int(x / scale), int(y / scale),
            int(w / scale), int(h / scale),
        ))
    return boxes


# ── Main tracking endpoint ────────────────────────────────────────────────────

@router.post("/track_person/{file_id}")
async def track_person(
    file_id: str,
    request: TrackPersonRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Tracks the selected person across all extracted video frames.

    Pipeline:
      1. Load the selected face crop and build a colour appearance signature
         (hair colour, skin tone, overall colour profile).
      2. Warm-up MOG2 background subtractor on the first ~40 frames so it
         learns what is static background (pavement, buildings, signs …).
      3. For every subsequent frame, apply MOG2 → get moving-person blobs.
      4. Score each blob against the appearance signature.
      5. If the best-matching blob exceeds the threshold → add to timeline.
    """

    # ── 1. Load + validate target face ──────────────────────────────────────
    face_rel  = request.face_path                    # "/uploads/faces_.../subject_N.jpg"
    face_abs  = os.path.join(
        os.getcwd(),
        face_rel.lstrip("/").replace("/", os.sep),
    )

    if not os.path.exists(face_abs):
        raise HTTPException(404, f"Face image not found: {face_abs}")

    target_img = _imread_unicode(face_abs)
    if target_img is None:
        raise HTTPException(422, "Could not decode target face image (path encoding issue?).")

    # ── 2. Build appearance signature ────────────────────────────────────────
    signature = _build_signature(target_img)
    if signature["hair"] is None:
        raise HTTPException(422, "Face image too small or unreadable to build appearance model.")

    # ── 3. Locate frame files ────────────────────────────────────────────────
    frames_dir = os.path.join(UPLOAD_DIR, f"frames_{file_id}")
    if not os.path.exists(frames_dir):
        raise HTTPException(404, "No extracted frames found. Run frame extraction first.")

    all_frames = sorted(
        f for f in os.listdir(frames_dir) if f.lower().endswith(".jpg")
    )
    if len(all_frames) < 2:
        raise HTTPException(404, "Not enough frames to track (need ≥ 2).")

    # ── 4. Warm-up background model ─────────────────────────────────────────
    #   MOG2 history=500 means it weighs ~500 frames to build the background.
    #   varThreshold=40: higher = less sensitive (ignore tiny flickers).
    #   detectShadows=True: labels shadow pixels separately (we filter them out).
    subtractor = cv2.createBackgroundSubtractorMOG2(
        history=300, varThreshold=40, detectShadows=True
    )

    WARMUP_N = min(40, len(all_frames) // 4)
    for fname in all_frames[:WARMUP_N]:
        f = _imread_unicode(os.path.join(frames_dir, fname))
        if f is not None:
            small = cv2.resize(f, (640, int(f.shape[0] * 640 / f.shape[1])))
            subtractor.apply(small, learningRate=0.05)

    # ── 5. Track across all frames ───────────────────────────────────────────
    MATCH_THRESHOLD = 0.35      # composite colour-match score to accept a detection
    timeline    = []
    event_count = 0

    for frame_filename in all_frames:
        frame_path = os.path.join(frames_dir, frame_filename)
        frame      = _imread_unicode(frame_path)
        if frame is None:
            continue

        # Person blobs via MOG2
        blobs = _apply_mog2(subtractor, frame)

        if not blobs:
            continue

        # Find the best-matching blob
        best_score = 0.0
        best_box   = None

        for (x, y, w, h) in blobs:
            x1 = max(0, x);            y1 = max(0, y)
            x2 = min(frame.shape[1], x + w);  y2 = min(frame.shape[0], y + h)
            crop = frame[y1:y2, x1:x2]
            if crop.size == 0:
                continue

            score = _score_body(crop, signature)
            if score > best_score:
                best_score = score
                best_box   = {"x": x1, "y": y1, "w": x2 - x1, "h": y2 - y1}

        if best_score >= MATCH_THRESHOLD and best_box:
            # ── Timestamp from frame filename ──────────────────────────────
            try:
                frame_idx = int(frame_filename.split("_")[1].split(".")[0])
            except Exception:
                frame_idx = event_count
            ts_secs      = frame_idx * 4          # 4 fps extraction
            mins, secs   = divmod(ts_secs, 60)
            hours, mins  = divmod(mins, 60)

            # ── Pose from position in frame ────────────────────────────────
            cx      = best_box["x"] + best_box["w"] / 2
            fw      = frame.shape[1]
            if cx < fw * 0.33:
                pose = "Left Side"
            elif cx > fw * 0.66:
                pose = "Right Side"
            else:
                pose = "Centre Frame"

            # ── Rough distance from body size ratio ────────────────────────
            area_ratio = (best_box["w"] * best_box["h"]) / max(frame.shape[0] * frame.shape[1], 1)
            distance_m = round(max(1.5, 10.0 - area_ratio * 800), 1)

            event_count += 1
            timeline.append({
                "event_id":    f"EVT_{event_count:03d}",
                "frame_path":  f"/uploads/frames_{file_id}/{frame_filename}",
                "timestamp":   f"{hours:02d}:{mins:02d}:{secs:02d}",
                "frame_number": frame_idx * 120,
                "confidence":  best_score,
                "pose":        pose,
                "distance_m":  distance_m,
                "bounding_box": best_box,
            })

    avg_confidence = (
        round(sum(e["confidence"] for e in timeline) / len(timeline), 3)
        if timeline else 0.0
    )

    return {
        "status":             "success",
        "file_id":            file_id,
        "face_id":            request.face_id,
        "person_id":          request.person_id,
        "total_appearances":  len(timeline),
        "average_confidence": avg_confidence,
        "timeline":           timeline,
        "embedding_model":    "MOG2 Background Subtraction + Colour Appearance Model",
        "similarity_metric":  "Hair · Skin · Clothing HSV Histogram Correlation",
        "threshold":          MATCH_THRESHOLD,
    }
