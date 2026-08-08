from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.connection import Base
from app.database.connection import engine

import app.models

from sqlalchemy import text

Base.metadata.create_all(bind=engine)

# Lightweight compatibility migration for existing development databases.
with engine.begin() as connection:
    connection.execute(text("ALTER TABLE helmet_detection_history ADD COLUMN IF NOT EXISTS user_id INTEGER"))
    connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(512)"))

from app.api.predict import router as predict_router
from app.api.auth import router as auth_router

app = FastAPI(
    title="Helmet Detection API",
    version="1.0.0",
    description="AI Helmet Detection Backend using YOLOv11",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://helmetify.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve processed files
app.mount(
    "/results",
    StaticFiles(directory="results"),
    name="results",
)

# Serve uploaded files
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

app.include_router(predict_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Helmet Detection API is running."
    }
