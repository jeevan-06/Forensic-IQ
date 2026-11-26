"""
Appends the Face Geometry Analysis endpoint to pipeline.py
"""
import os

SRC = "c:/Users/Jeevan Kumar/OneDrive/文档/project/backend/app/api/pipeline.py"

NEW_CODE = """

# ==============================================================================
# PHASE 4.5: FACE GEOMETRY ANALYSIS (Mediapipe)
# ==============================================================================
class AnalyzeFaceGeometryRequest(BaseModel):
    face_path: str  # e.g., /uploads/enhanced_xxx/enhanced.jpg

@router.post("/analyze_face_geometry/{file_id}")
async def analyze_face_geometry(
    file_id: str,
    request: AnalyzeFaceGeometryRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        import mediapipe as mp
    except ImportError:
        raise HTTPException(status_code=500, detail="Mediapipe is not installed on the server.")

    import math
    import cv2
    import numpy as np

    face_rel = request.face_path
    face_abs = os.path.join(os.getcwd(), face_rel.lstrip("/").replace("/", os.sep))

    if not os.path.exists(face_abs):
        raise HTTPException(status_code=404, detail=f"Enhanced face not found: {face_abs}")

    img = _imread_unicode(face_abs)
    if img is None:
        raise HTTPException(status_code=422, detail="Failed to decode face image.")

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    h, w, _ = img.shape

    mp_face_mesh = mp.solutions.face_mesh
    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles

    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    ) as face_mesh:
        results = face_mesh.process(img_rgb)

        if not results.multi_face_landmarks:
            raise HTTPException(status_code=400, detail="Could not detect facial landmarks on the enhanced image.")

        face_landmarks = results.multi_face_landmarks[0]
        
        # Helper to get pixel coordinates
        def pt(idx):
            landmark = face_landmarks.landmark[idx]
            return (int(landmark.x * w), int(landmark.y * h))
        
        def dist(p1, p2):
            return math.hypot(p1[0] - p2[0], p1[1] - p2[1])

        # Mediapipe Landmark Indices
        LEFT_PUPIL = 468
        RIGHT_PUPIL = 473
        LEFT_EYE_OUTER = 33
        RIGHT_EYE_OUTER = 263
        NOSE_LEFT = 129
        NOSE_RIGHT = 358
        CHEEK_LEFT = 234
        CHEEK_RIGHT = 454
        CHIN = 152
        JAW_LEFT = 132
        JAW_RIGHT = 361
        LIP_TOP_OUTER = 0
        LIP_BOTTOM_OUTER = 17
        LIP_LEFT = 61
        LIP_RIGHT = 291
        FOREHEAD = 10

        # Calculate Measurements
        interocular_dist = dist(pt(LEFT_PUPIL), pt(RIGHT_PUPIL))
        nose_width = dist(pt(NOSE_LEFT), pt(NOSE_RIGHT))
        face_width = dist(pt(CHEEK_LEFT), pt(CHEEK_RIGHT))
        face_height = dist(pt(FOREHEAD), pt(CHIN))
        jaw_width = dist(pt(JAW_LEFT), pt(JAW_RIGHT))
        
        lip_width = dist(pt(LIP_LEFT), pt(LIP_RIGHT))
        lip_height = dist(pt(LIP_TOP_OUTER), pt(LIP_BOTTOM_OUTER))

        # Geometric Calculations
        jaw_angle = math.degrees(math.acos( max(-1.0, min(1.0, ( (dist(pt(CHIN), pt(JAW_LEFT))**2 + dist(pt(CHIN), pt(JAW_RIGHT))**2 - jaw_width**2) / (2 * dist(pt(CHIN), pt(JAW_LEFT)) * dist(pt(CHIN), pt(JAW_RIGHT)) + 1e-6) ))) ))
        lip_ratio = lip_width / (lip_height + 1e-6)
        face_ratio = face_height / (face_width + 1e-6)

        # Eye Symmetry (Difference in height from chin)
        left_eye_h = pt(LEFT_PUPIL)[1]
        right_eye_h = pt(RIGHT_PUPIL)[1]
        eye_sym = 100 - min(100, abs(left_eye_h - right_eye_h) / (face_height + 1e-6) * 100 * 5) # Scale diff to percentage

        # Draw wireframe
        annotated_image = img.copy()
        mp_drawing.draw_landmarks(
            image=annotated_image,
            landmark_list=face_landmarks,
            connections=mp_face_mesh.FACEMESH_TESSELATION,
            landmark_drawing_spec=None,
            connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_tesselation_style())
        mp_drawing.draw_landmarks(
            image=annotated_image,
            landmark_list=face_landmarks,
            connections=mp_face_mesh.FACEMESH_CONTOURS,
            landmark_drawing_spec=None,
            connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_contours_style())

        # Save annotated image
        geometry_filename = f"geometry_{os.path.basename(face_abs)}"
        geometry_dir = os.path.dirname(face_abs)
        geometry_abs = os.path.join(geometry_dir, geometry_filename)
        cv2.imwrite(geometry_abs, annotated_image)

        geometry_rel = f"{os.path.dirname(face_rel)}/{geometry_filename}"

        return {
            "status": "success",
            "geometry_image_path": geometry_rel,
            "measurements": {
                "interocular_distance": { "value": round(interocular_dist, 1), "unit": "px", "description": "Eye spacing" },
                "nose_width": { "value": round(nose_width, 1), "unit": "px", "description": "Facial proportion" },
                "face_width": { "value": round(face_width, 1), "unit": "px", "description": "Shape analysis" },
                "jaw_angle": { "value": round(jaw_angle, 1), "unit": "deg", "description": "Face structure" },
                "lip_ratio": { "value": round(lip_ratio, 2), "unit": "ratio", "description": "Symmetry analysis" },
                "face_ratio": { "value": round(face_ratio, 2), "unit": "ratio", "description": "Identity verification" },
                "eye_symmetry": { "value": round(eye_sym, 1), "unit": "%", "description": "Deepfake detection" }
            }
        }
"""

with open(SRC, "a", encoding="utf-8") as f:
    f.write(NEW_CODE)

print("Endpoint appended to pipeline.py")
