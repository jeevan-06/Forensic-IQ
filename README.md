# FORENSIQ — AI-Assisted Forensic Face Enhancement & 3D Reconstruction System

**FORENSIQ** is a full-stack forensic investigation platform designed to process low-resolution CCTV footage and still images through a multi-stage computer vision and AI enhancement pipeline. It provides investigators with frame extraction, face detection, Real-ESRGAN super-resolution enhancement, facial geometry analysis, interactive 3D face reconstruction, multi-frame person tracking, suspect database matching, and forensic report generation—secured with JWT authentication and optional TOTP two-factor authentication (2FA).

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Forensic Pipeline Overview](#forensic-pipeline-overview)
- [API Reference](#api-reference)
- [Frontend Views](#frontend-views)
- [Configuration & Security Notes](#configuration--security-notes)

---

## Key Features

- **Evidence Ingestion & Frame Extraction**: Supports still images (`JPEG`, `PNG`) and video files (`MP4`, `AVI`) with automatic frame extraction for video evidence.
- **Face Detection & Extraction**: Isolates subject faces from extracted frames or uploaded images for downstream analysis.
- **AI Super-Resolution Enhancement**: Uses bundled **Real-ESRGAN NCNN Vulkan** (`realesrgan-ncnn-vulkan.exe`) models (`realesrgan-x4plus`, `realesrgan-x4plus-anime`, `realesr-animevideov3` at x2/x3/x4) to upscale and clarify low-resolution facial crops.
- **Facial & Scene Geometry Analysis**: Computes geometric measurements and pose/landmark metrics on both scene frames and extracted faces.
- **Interactive 3D Face Reconstruction**: Reconstructs and renders 3D facial geometry in the browser using **Three.js** (`@react-three/fiber` and `@react-three/drei`).
- **Person Tracking Across CCTV Frames**: Implements **MOG2 background subtraction** paired with a 3-zone **HSV appearance signature** (hair, skin, and full-body color histograms) to track a selected subject across video frames—including back-view CCTV footage.
- **Criminal Database & Face Matching**: SQLite-backed suspect registry (`criminals` table in `forensiq.db`) supporting enrollment, listing, deletion, and similarity matching using OpenCV HSV histogram Bhattacharyya distance.
- **Forensic Report Generation**: Compiles case findings, enhanced imagery, geometry metrics, and match results into a structured forensic report view.
- **Authentication & 2FA**: User registration and login with `bcrypt` password hashing, `HS256` JWT access tokens, and TOTP-based 2FA (`pyotp`) with QR code provisioning.

---

## Tech Stack

### Backend
- **Framework**: FastAPI, Uvicorn
- **Database**: SQLAlchemy + SQLite (`backend/forensiq.db`)
- **Computer Vision & AI**: OpenCV (`cv2`), NumPy, Real-ESRGAN NCNN Vulkan
- **Security & Auth**: PyJWT, Passlib (`bcrypt`), PyOTP, Pydantic / `pydantic-settings`

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling & Animation**: Tailwind CSS, Framer Motion, Lucide React
- **3D & Image Inspection**: Three.js (`@react-three/fiber`, `@react-three/drei`), `react-zoom-pan-pinch`
- **State, Routing & Networking**: Zustand, React Router DOM, Axios, `qrcode.react`

---

## Project Structure

```text
Forensic-IQ/
├── .gitignore
├── README.md
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py            # Register, login, JWT validation, TOTP 2FA endpoints
│   │   │   ├── pipeline.py        # Forensic upload, enhancement, geometry, 3D, matching & report APIs
│   │   │   └── tracking.py        # MOG2 + HSV appearance person tracking module
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic BaseSettings configuration
│   │   │   ├── database.py        # SQLAlchemy engine & session setup (sqlite:///./forensiq.db)
│   │   │   └── security.py        # Password hashing, JWT creation, TOTP helpers
│   │   ├── models/
│   │   │   └── user.py            # User ORM model
│   │   ├── schemas/
│   │   │   └── user.py            # Pydantic request/response schemas
│   │   └── main.py                # FastAPI app, CORS, router registration, static mounts
│   ├── models/
│   │   └── realesrgan-ncnn/       # Real-ESRGAN NCNN Vulkan binary & model weights (.bin/.param)
│   └── requirements.txt
└── frontend/
    ├── public/
    │   ├── database/              # Enrolled suspect mugshot images (served at /database)
    │   └── images/                # Reference & visualization assets
    ├── src/
    │   ├── components/
    │   │   ├── AnalysisScanner.tsx
    │   │   ├── FaceViewer3D.tsx   # Interactive 3D face reconstruction viewer
    │   │   ├── ReportViewer.tsx   # Forensic report display
    │   │   ├── Sidebar.tsx
    │   │   └── UploadZone.tsx
    │   ├── pages/
    │   │   ├── AnalyticsView.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── DatabaseManagement.tsx
    │   │   ├── Investigator.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   ├── SettingsView.tsx
    │   │   └── TwoFactorSetup.tsx
    │   ├── services/
    │   │   └── api.ts             # Axios client (baseURL: http://localhost:8000/api)
    │   ├── store/
    │   │   └── authStore.ts       # Zustand auth state
    │   └── App.tsx
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18 or higher and **npm**
- Windows (for the bundled `realesrgan-ncnn-vulkan.exe` binary; other platforms require a compatible `realesrgan-ncnn-vulkan` executable)

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows (PowerShell)
   .\venv\Scripts\Activate.ps1
   # macOS / Linux
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   > **Note**: Ensure `opencv-python` and `numpy` are installed in the environment if not already present, as they are used by `pipeline.py` and `tracking.py`.

4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   - API base URL: `http://localhost:8000`
   - Interactive Swagger UI: `http://localhost:8000/docs`

### Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Frontend URL: `http://localhost:5173`

---

## Forensic Pipeline Overview

1. **Upload Evidence** (`POST /api/pipeline/upload`) — Stores incoming image/video evidence in `backend/uploads/` with a UUID filename.
2. **Frame Extraction** (`POST /api/pipeline/extract_frames/{file_id}`) — Samples frames from uploaded videos (or prepares still images).
3. **Face Detection** (`POST /api/pipeline/extract_faces/{file_id}`) — Extracts candidate face crops for investigator selection.
4. **Super-Resolution Enhancement** (`POST /api/pipeline/enhance_face/{file_id}`) — Enhances selected face crops using Real-ESRGAN NCNN.
5. **Geometry & 3D Reconstruction** (`POST /api/pipeline/analyze_geometry/{file_id}`, `analyze_face_geometry/{file_id}`, `reconstruct_3d/{file_id}`) — Computes facial/scene measurements and generates 3D mesh/pose data for `FaceViewer3D`.
6. **Person Tracking** (`POST /api/pipeline/track_person/{file_id}`) — Warms up MOG2 on early frames, detects moving person blobs, and scores each blob against the target's hair/skin/full-body HSV histogram signature.
7. **Suspect Matching & Reporting** (`POST /api/pipeline/match_face/{file_id}`, `generate_report/{file_id}`) — Compares the enhanced face against enrolled records in `forensiq.db` and compiles the final forensic report.

---

## API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new investigator account |
| `POST` | `/api/auth/login` | Authenticate with username/email + password (and optional TOTP code) |
| `POST` | `/api/auth/2fa/setup` | Retrieve TOTP secret and `otpauth://` provisioning URI |
| `POST` | `/api/auth/2fa/enable` | Verify TOTP code and enable 2FA on the account |
| `GET` | `/api/auth/me` | Return the currently authenticated user profile |

### Forensic Pipeline & Suspect Database (`/api/pipeline`)

All pipeline endpoints require a valid `Bearer` JWT token.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/pipeline/upload` | Upload image (`JPEG`/`PNG`) or video (`MP4`/`AVI`) evidence |
| `POST` | `/api/pipeline/extract_frames/{file_id}` | Extract frames from uploaded video evidence |
| `POST` | `/api/pipeline/analyze_geometry/{file_id}` | Run scene/frame geometry analysis |
| `POST` | `/api/pipeline/extract_faces/{file_id}` | Detect and crop faces from evidence |
| `POST` | `/api/pipeline/enhance_face/{file_id}` | Upscale and enhance a face crop with Real-ESRGAN |
| `POST` | `/api/pipeline/track_person/{file_id}` | Track a selected subject across video frames |
| `POST` | `/api/pipeline/analyze_face_geometry/{file_id}` | Analyze facial landmark geometry |
| `POST` | `/api/pipeline/reconstruct_3d/{file_id}` | Generate 3D facial reconstruction data |
| `POST` | `/api/pipeline/match_face/{file_id}` | Match target face against enrolled suspects |
| `POST` | `/api/pipeline/generate_report/{file_id}` | Generate a structured forensic report |
| `POST` | `/api/pipeline/enroll_criminal` | Enroll a new suspect record and mugshot |
| `GET` | `/api/pipeline/criminals` | List all enrolled suspects |
| `DELETE` | `/api/pipeline/criminals/{criminal_id}` | Remove a suspect record |

### Static Mounts
- `/uploads` — Serves uploaded evidence, extracted frames, face crops, and enhanced outputs.
- `/database` — Serves enrolled suspect mugshots from `frontend/public/database`.

---

## Frontend Views

- **Login / Register / 2FA Setup**: Investigator authentication and TOTP QR enrollment.
- **Dashboard & Investigator**: Evidence upload, pipeline step execution, zoomable image comparison, and interactive 3D face viewer.
- **Database Management**: Add, inspect, and remove suspect profiles in the local database.
- **Analytics & Settings**: Investigation metrics and workspace preferences.

---

## Configuration & Security Notes

- **CORS**: Configured in `backend/app/main.py` for `http://localhost:5173`, `http://127.0.0.1:5173`, and `http://localhost:3000`.
- **JWT Secret**: `SECRET_KEY` in `backend/app/core/security.py` is set to a development default (`SUPER_SECRET_FORENSIQ_KEY`). Replace it with an environment variable before any production deployment.
- **Database & Uploads**: Runtime SQLite database (`forensiq.db`) and `backend/uploads/` are excluded from version control via `.gitignore`.
