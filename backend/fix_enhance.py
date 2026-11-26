"""
Fixes all forensic enhancement issues:
1. Always-on mild denoising (h=2 base, catches compression artifacts)
2. Identity-preserving SR: 55% AI + 45% Lanczos anchor blend
3. Final output = 2x (not 4x) for forensic defensibility
4. Reduced sharpening amounts to eliminate halo artifacts
5. Conservative CLAHE (clipLimit=1.2, 30% blend)
6. Normalised sharpness metrics
"""

SRC = "app/api/pipeline.py"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# ── Locate replacement boundaries ─────────────────────────────────────────────
START_MARKER = "def _select_forensic_scale"
END_MARKER   = "# STAGE 4"

start_idx = content.find(START_MARKER)
end_idx   = content.find(END_MARKER)

assert start_idx != -1, "START_MARKER not found"
assert end_idx   != -1, "END_MARKER not found"

# Walk backwards from start_idx to include any preceding blank lines / comments
while start_idx > 0 and content[start_idx - 1] in ("\n", "\r", " "):
    start_idx -= 1
start_idx += 1   # keep the newline before the function

print(f"Replacing chars {start_idx}–{end_idx}")

# ── Replacement block ──────────────────────────────────────────────────────────
NEW_SECTION = r'''
def _select_forensic_scale(width: int, height: int) -> int:
    """
    Forensic-grade scale selection.
    Final output = 2x for faces under 512px (AI runs internally at 4x,
    then we blend and downsample so the output is not over-expanded).
    """
    longest_edge = max(width, height)
    if longest_edge < 512:
        return 2   # 2x final output, AI SR runs at 4x internally
    if longest_edge < 1024:
        return 2   # mild 2x for medium frames
    return 1       # already large enough


def _align_face_by_eyes(image) -> tuple:
    """Rotate only when OpenCV finds a stable two-eye line."""
    import cv2, numpy as np
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_eye.xml")
        eye_cascade = cv2.CascadeClassifier(cascade_path)
        if eye_cascade.empty():
            return image.copy(), "Skipped (eye detector unavailable)", False

        h, w = gray.shape[:2]
        min_eye = max(8, min(w, h) // 12)
        detected = eye_cascade.detectMultiScale(
            gray,
            scaleFactor=1.08,
            minNeighbors=4,
            minSize=(min_eye, min_eye),
        )

        candidates = []
        for x, y, ew, eh in detected:
            if y > h * 0.68:
                continue
            candidates.append((x, y, ew, eh, ew * eh))

        if len(candidates) < 2:
            return image.copy(), "Skipped (eyes not reliably detected)", False

        candidates = sorted(candidates, key=lambda item: item[4], reverse=True)[:6]
        best_pair, best_score = None, -1.0
        for idx, first in enumerate(candidates):
            for second in candidates[idx + 1:]:
                x1, y1, w1, h1, _ = first
                x2, y2, w2, h2, _ = second
                c1 = (x1 + w1 / 2.0, y1 + h1 / 2.0)
                c2 = (x2 + w2 / 2.0, y2 + h2 / 2.0)
                dx = abs(c2[0] - c1[0])
                dy = abs(c2[1] - c1[1])
                if dx < w * 0.18 or dy > h * 0.18:
                    continue
                score = dx - dy * 2.0
                if score > best_score:
                    best_score = score
                    best_pair = (c1, c2)

        if best_pair is None:
            return image.copy(), "Skipped (eye geometry unstable)", False

        left_eye, right_eye = sorted(best_pair, key=lambda p: p[0])
        dx    = right_eye[0] - left_eye[0]
        dy    = right_eye[1] - left_eye[1]
        angle = float(np.degrees(np.arctan2(dy, dx)))
        if abs(angle) < 1.0:
            return image.copy(), "Already level", False
        if abs(angle) > 12.0:
            return image.copy(), f"Skipped (unsafe angle {angle:.1f} deg)", False

        center = ((left_eye[0] + right_eye[0]) / 2.0,
                  (left_eye[1] + right_eye[1]) / 2.0)
        matrix  = cv2.getRotationMatrix2D(center, angle, 1.0)
        aligned = cv2.warpAffine(
            image, matrix, (w, h),
            flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE,
        )
        return aligned, f"Eye-line rotation {angle:.1f} deg", True
    except Exception:
        return image.copy(), "Skipped (alignment failed)", False


def _realesrgan_paths() -> tuple:
    backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    model_dir    = os.path.join(backend_root, "models", "realesrgan-ncnn")
    env_exe      = os.getenv("REALESRGAN_NCNN_EXE")
    candidates   = [
        env_exe,
        os.path.join(model_dir, "realesrgan-ncnn-vulkan.exe"),
        os.path.join(model_dir, "realesrgan-ncnn-vulkan"),
        shutil.which("realesrgan-ncnn-vulkan.exe"),
        shutil.which("realesrgan-ncnn-vulkan"),
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c, model_dir
    return None, model_dir


def _run_realesrgan_4x(image) -> tuple:
    """
    Runs RealESRGAN-x4plus at native 4x.
    Returns (sr_image_4x, label) or (None, error_message).
    """
    exe_path, model_dir = _realesrgan_paths()
    if not exe_path:
        return None, "realesrgan-ncnn-vulkan not found"
    if not os.path.isdir(model_dir):
        return None, "RealESRGAN model directory missing"

    with tempfile.TemporaryDirectory() as tmpdir:
        inp = os.path.join(tmpdir, "face.png")
        out = os.path.join(tmpdir, "face_sr.png")
        if not cv2.imwrite(inp, image):
            return None, "Could not write temp input"

        cmd = [exe_path, "-i", inp, "-o", out,
               "-n", "realesrgan-x4plus", "-s", "4",
               "-m", model_dir, "-f", "png"]
        try:
            r = subprocess.run(cmd, capture_output=True, text=True,
                               timeout=120, check=False)
        except Exception as e:
            return None, f"Process error: {e}"

        if r.returncode != 0 or not os.path.exists(out):
            msg = (r.stderr or r.stdout or "").strip()[:120]
            return None, f"rc={r.returncode}: {msg}"

        sr = _imread_unicode(out)
        if sr is None:
            return None, "Output file unreadable"
        return sr, "RealESRGAN x4plus (GPU/Vulkan)"


def _identity_preserving_sr(image, target_scale: int) -> tuple:
    """
    Identity-preserving AI super-resolution:

    Step A  Run RealESRGAN at native 4x  (AI texture reconstruction)
    Step B  Compute Lanczos at target_scale  (identity anchor)
    Step C  If AI succeeded:
              - Downsample AI result to target_scale
              - Blend  55 % AI  +  45 % Lanczos
            If AI failed:
              - Return pure Lanczos as fallback

    The 45 % Lanczos anchor prevents hallucination / identity drift while
    still benefiting from AI-reconstructed texture.  This ratio is tuned
    for forensic use where identity preservation > visual quality.
    """
    h, w   = image.shape[:2]
    tw, th = w * target_scale, h * target_scale

    # Always compute Lanczos reference (identity anchor)
    lanczos_ref = cv2.resize(image, (tw, th), interpolation=cv2.INTER_LANCZOS4)

    # Try AI upscale
    sr_4x, sr_label = _run_realesrgan_4x(image)
    if sr_4x is None:
        return lanczos_ref, f"Lanczos {target_scale}x (AI failed: {sr_label})", False

    # Downsample AI 4x result to target scale
    if target_scale < 4:
        sr_at_target = cv2.resize(sr_4x, (tw, th), interpolation=cv2.INTER_AREA)
    else:
        sr_at_target = sr_4x

    # Identity-preserving blend
    AI_W  = 0.55
    REF_W = 0.45
    blended = cv2.addWeighted(sr_at_target, AI_W, lanczos_ref, REF_W, 0)

    label = (f"{sr_label} x4 -> {target_scale}x  "
             f"({int(AI_W*100)}% AI + {int(REF_W*100)}% Lanczos anchor)")
    return blended, label, True


def _controlled_sharpen(img_u8, scale: int) -> tuple:
    """
    Conservative multi-pass Unsharp Mask.

    Sigma is proportional to upscale so we target the correct frequency band.
    Amounts are kept LOW (0.18 fine / 0.08 medium) to eliminate halo artifacts
    while still recovering some edge crispness after blending.
    Residuals are hard-clipped to suppress ringing around high-contrast edges
    (glasses frames, hairlines, jaw edges).
    """
    f = img_u8.astype(np.float32)

    sigma_fine = max(0.8, 1.0 * scale)
    blur_fine  = cv2.GaussianBlur(f, (0, 0), sigmaX=sigma_fine)
    fine_mask  = np.clip(f - blur_fine, -8.0 * scale, 8.0 * scale)
    sharpened  = f + 0.18 * fine_mask        # was 0.35 — halved to kill halos

    sigma_med  = max(2.0, 2.5 * scale)
    blur_med   = cv2.GaussianBlur(f, (0, 0), sigmaX=sigma_med)
    med_mask   = np.clip(f - blur_med, -16.0 * scale, 16.0 * scale)
    sharpened  = sharpened + 0.08 * med_mask  # was 0.20

    return (np.clip(sharpened, 0, 255).astype(np.uint8),
            f"USM sigma={sigma_fine:.1f}+{sigma_med:.1f} amt=0.18+0.08 (anti-halo)")


@router.post("/enhance_face/{file_id}")
async def enhance_face(
    file_id: str,
    request: EnhanceFaceRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Forensic-grade face enhancement pipeline v4.

    Fixes applied vs v3:
    - Identity-preserving SR (55% AI + 45% Lanczos): prevents hallucination
    - Always-on mild NLM denoising: catches CCTV compression artifacts
    - Final output = 2x (forensically defensible, not 4x)
    - Reduced USM amounts (0.18 + 0.08): eliminates halo / ringing artifacts
    - Sharpness compared at same resolution: fair before/after metric
    """
    # -- Load face image -------------------------------------------------------
    face_rel = request.face_path
    face_abs = os.path.join(os.getcwd(), face_rel.lstrip("/").replace("/", os.sep))
    if not os.path.exists(face_abs):
        raise HTTPException(404, f"Face image not found: {face_abs}")
    original = _imread_unicode(face_abs)
    if original is None:
        raise HTTPException(422, "Could not decode face image")

    h_orig, w_orig = original.shape[:2]
    gray_orig     = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    sharp_before  = _sharpness_score(gray_orig)
    bright_before = _brightness_score(gray_orig)
    noise_before  = _noise_estimate(gray_orig)

    # -- STEP 1: EYE-LINE ALIGNMENT -------------------------------------------
    aligned, alignment_label, alignment_applied = _align_face_by_eyes(original)

    # -- STEP 2: ALWAYS-ON MILD DENOISING ------------------------------------
    # Even a "clean" CCTV frame carries JPEG compression artifacts and
    # H.264 block noise that USM sharpening would amplify.  We always apply
    # a minimum h=2 NLM pass on the Y channel only.
    h_nlm = max(2, min(6, int(noise_before / 3.5)))
    ycrcb = cv2.cvtColor(aligned, cv2.COLOR_BGR2YCrCb)
    y_ch, cr_ch, cb_ch = cv2.split(ycrcb)
    y_d   = cv2.fastNlMeansDenoising(
        y_ch, None, h=h_nlm,
        templateWindowSize=7, searchWindowSize=21,
    )
    denoised      = cv2.cvtColor(cv2.merge([y_d, cr_ch, cb_ch]),
                                 cv2.COLOR_YCrCb2BGR)
    denoise_label = f"NLM Y-ch h={h_nlm} (noise={noise_before:.1f})"
    denoise_applied = True

    # -- STEP 3: IDENTITY-PRESERVING AI SUPER-RESOLUTION ----------------------
    scale = _select_forensic_scale(w_orig, h_orig)
    if scale >= 2:
        upscaled, sr_method, ai_used = _identity_preserving_sr(denoised, scale)
    else:
        upscaled  = denoised.copy()
        sr_method = "No upscale (source >= 512px)"
        ai_used   = False
    h_sr, w_sr = upscaled.shape[:2]
    actual_scale = scale

    # -- STEP 4: CONSERVATIVE SCALE-AWARE SHARPENING --------------------------
    sharpened, sharpen_method = _controlled_sharpen(upscaled, actual_scale)

    # -- STEP 5: ADAPTIVE GAMMA (dark CCTV only) ------------------------------
    mean_lum = float(np.mean(cv2.cvtColor(sharpened, cv2.COLOR_BGR2GRAY)))
    if   mean_lum < 55:  gamma = 0.75
    elif mean_lum < 85:  gamma = 0.85
    elif mean_lum < 115: gamma = 0.92
    else:                gamma = 1.00

    if gamma < 1.0:
        lut       = np.array([min(255, int(((i / 255.0) ** gamma) * 255))
                              for i in range(256)], dtype=np.uint8)
        sharpened = cv2.LUT(sharpened, lut)

    # -- STEP 6: GENTLE CLAHE on Y-channel only --------------------------------
    ycrcb_sr = cv2.cvtColor(sharpened, cv2.COLOR_BGR2YCrCb)
    y_sr, cr_sr, cb_sr = cv2.split(ycrcb_sr)
    clahe    = cv2.createCLAHE(clipLimit=1.2, tileGridSize=(4, 4))
    y_clahe  = clahe.apply(y_sr)
    y_final  = cv2.addWeighted(y_sr, 0.70, y_clahe, 0.30, 0)  # 70/30 blend
    final    = cv2.cvtColor(cv2.merge([y_final, cr_sr, cb_sr]),
                            cv2.COLOR_YCrCb2BGR)

    # -- Normalised metrics (compare at original pixel count) ------------------
    gray_final       = cv2.cvtColor(final, cv2.COLOR_BGR2GRAY)
    bright_after     = _brightness_score(gray_final)
    noise_after      = _noise_estimate(gray_final)
    sharp_after_norm = _normalized_sharpness(gray_final, (w_orig, h_orig))
    sharp_gain       = round((sharp_after_norm / max(sharp_before, 0.01) - 1) * 100, 1)
    noise_redux      = round((1 - noise_after / max(noise_before, 0.01)) * 100, 1)

    # -- Save (Unicode-safe) ---------------------------------------------------
    enhanced_dir  = os.path.join(UPLOAD_DIR, f"enhanced_{file_id}")
    os.makedirs(enhanced_dir, exist_ok=True)
    enhanced_name = f"enhanced_{os.path.basename(face_abs)}"
    enhanced_abs  = os.path.join(enhanced_dir, enhanced_name)

    ok, buf = cv2.imencode(".jpg", final, [cv2.IMWRITE_JPEG_QUALITY, 97])
    if not ok:
        raise HTTPException(500, "Failed to encode enhanced image")
    with open(enhanced_abs, "wb") as fh:
        fh.write(buf.tobytes())

    return {
        "status":        "success",
        "original_path": face_rel,
        "enhanced_path": f"/uploads/enhanced_{file_id}/{enhanced_name}",
        "original_size": {"w": w_orig, "h": h_orig},
        "enhanced_size": {"w": w_sr,   "h": h_sr},
        "scale_factor":  actual_scale,
        "ai_sr_used":    ai_used,
        "metrics": {
            "sharpness_before":    round(sharp_before,       2),
            "sharpness_after":     round(sharp_after_norm,   2),
            "sharpness_gain_pct":  sharp_gain,
            "noise_before":        round(noise_before,       2),
            "noise_after":         round(noise_after,        2),
            "noise_reduction_pct": noise_redux,
            "brightness_before":   round(bright_before,      1),
            "brightness_after":    round(bright_after,       1),
            "resolution_before":   f"{w_orig}x{h_orig}",
            "resolution_after":    f"{w_sr}x{h_sr}",
        },
        "steps": [
            {"id": 1, "name": "Face Alignment",
             "method": alignment_label,
             "status": "done" if alignment_applied else "skipped"},
            {"id": 2, "name": "Denoising",
             "method": denoise_label,
             "status": "done"},
            {"id": 3, "name": "AI Super Resolution",
             "method": sr_method,
             "status": "done"},
            {"id": 4, "name": "Detail Sharpening",
             "method": sharpen_method,
             "status": "done"},
            {"id": 5, "name": "Tonal Correction",
             "method": f"Gamma {gamma:.2f} + CLAHE 30pct Y-only",
             "status": "done"},
        ],
    }


'''

new_content = content[:start_idx] + NEW_SECTION + content[end_idx:]

with open(SRC, "w", encoding="utf-8", newline="") as f:
    f.write(new_content)

print(f"Written. New file size: {len(new_content)} chars")
