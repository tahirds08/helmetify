from pathlib import Path
import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.crud.detection import (
    create_detection,
    delete_all_detections,
    get_all_detections,
    get_dashboard_stats,
)
from app.database.connection import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.services.yolo_service import YOLOService


router = APIRouter(
    prefix="/predict",
    tags=["Prediction"],
)


UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)


# ============================================================
# IMAGE DETECTION
# ============================================================

@router.post("/")
async def predict_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    if (
        file.content_type is None
        or not file.content_type.startswith("image/")
    ):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file.",
        )

    extension = Path(
        file.filename or "image.jpg"
    ).suffix

    filename = f"{uuid.uuid4()}{extension}"

    file_path = UPLOAD_FOLDER / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )

    prediction = YOLOService.predict(
        str(file_path)
    )

    create_detection(
        db=db,
        user_id=int(getattr(user, "id")),
        source="Image Upload",
        result=prediction["result"],
        confidence=prediction["confidence"],
        original_image=prediction["original_image"],
        annotated_image=prediction["annotated_image"],
    )

    return {
        "success": True,
        "prediction": prediction,
    }


# ============================================================
# VIDEO DETECTION
# ============================================================

@router.post("/video")
async def predict_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    if (
        file.content_type is None
        or not file.content_type.startswith("video/")
    ):
        raise HTTPException(
            status_code=400,
            detail="Please upload a video file.",
        )

    extension = Path(
        file.filename or "video.mp4"
    ).suffix

    filename = f"{uuid.uuid4()}{extension}"

    file_path = UPLOAD_FOLDER / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )

    prediction = YOLOService.predict_video(
        str(file_path)
    )

    create_detection(
        db=db,
        user_id=int(getattr(user, "id")),
        source="Video Upload",
        result=prediction["result"],
        confidence=prediction["confidence"],
        original_video=prediction["original_video"],
        annotated_video=prediction["annotated_video"],
    )

    return {
        "success": True,
        "prediction": prediction,
    }


# ============================================================
# LIVE CAMERA
# ============================================================

@router.post("/camera")
async def predict_camera(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    # The frontend sends one webcam frame as an image.
    if (
        file.content_type is None
        or not file.content_type.startswith("image/")
    ):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid camera frame.",
        )

    filename = f"{uuid.uuid4()}.jpg"

    file_path = UPLOAD_FOLDER / filename

    # Save the captured camera frame.
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )

    # Run detection specifically for a camera frame.
    prediction = YOLOService.predict_camera_frame(
        str(file_path)
    )

    # Save this camera detection to history.
    create_detection(
        db=db,
        user_id=int(getattr(user, "id")),
        source="Live Camera",
        result=prediction["result"],
        confidence=prediction["confidence"],
        original_image=str(file_path),
        annotated_image=prediction.get(
            "annotated_image"
        ),
    )

    return {
        "success": True,
        "prediction": {
            **prediction,
            "original_image": str(file_path),
        },
    }


# ============================================================
# HISTORY
# ============================================================

@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    detections = get_all_detections(db, int(getattr(user, "id")))

    return [
        {
            "id": detection.id,
            "source": detection.source,
            "result": detection.result,
            "confidence": detection.confidence,
            "original_image": detection.original_image,
            "annotated_image": detection.annotated_image,
            "original_video": detection.original_video,
            "annotated_video": detection.annotated_video,
            "created_at": detection.created_at,
        }
        for detection in detections
    ]


# ============================================================
# CLEAR HISTORY
# ============================================================

@router.delete("/history")
def clear_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    user_id = int(getattr(user, "id"))
    detections = get_all_detections(db, user_id)

    # Delete only files created for this user's detection history.
    for detection in detections:

        for field_name in [
            "original_image",
            "annotated_image",
            "original_video",
            "annotated_video",
        ]:

            file_path = getattr(detection, field_name, None)

            if not isinstance(file_path, str) or not file_path:
                continue

            path = Path(file_path)

            if path.exists() and path.is_file():
                path.unlink()

    # Delete detection history from database after files are removed.
    delete_all_detections(db, user_id)

    return {
        "success": True,
        "message": "History cleared successfully.",
    }


# ============================================================
# DASHBOARD
# ============================================================

@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    return get_dashboard_stats(db, int(getattr(user, "id")))
