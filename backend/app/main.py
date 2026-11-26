from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, pipeline
from app.core.database import engine, Base
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FORENSIQ API",
    description="AI-Assisted Forensic Face Enhancement & 3D Reconstruction System",
    version="1.0.0",
)

# ── CORS MUST be registered first, before any mounts ──────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://127.0.0.1:5173",   # alternate localhost
        "http://localhost:3000",   # fallback
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(pipeline.router, prefix="/api/pipeline", tags=["pipeline"])

# ── Static file mounts (after routers so CORS middleware wraps everything) ────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

_db_img_dir = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../frontend/public/database")
)
os.makedirs(_db_img_dir, exist_ok=True)
app.mount("/database", StaticFiles(directory=_db_img_dir), name="database")

@app.get("/")
async def root():
    return {"message": "Welcome to FORENSIQ API"}
