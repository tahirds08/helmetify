from datetime import date
from calendar import month_abbr

from sqlalchemy import extract, func, text
from sqlalchemy.orm import Session

from app.models.detection import Detection


def create_detection(
    db: Session,
    user_id: int,
    result: str,
    confidence: float,
    source: str,
    original_image: str | None = None,
    annotated_image: str | None = None,
    original_video: str | None = None,
    annotated_video: str | None = None,
):

    detection = Detection(
        user_id=user_id,
        source=source,
        result=result,
        confidence=confidence,
        original_image=original_image,
        annotated_image=annotated_image,
        original_video=original_video,
        annotated_video=annotated_video,
    )

    db.add(detection)
    db.commit()
    db.refresh(detection)

    return detection


def get_all_detections(db: Session, user_id: int):

    return (
        db.query(Detection).filter(Detection.user_id == user_id)
        .order_by(Detection.created_at.desc())
        .all()
    )


def delete_all_detections(db: Session, user_id: int):

    db.query(Detection).filter(Detection.user_id == user_id).delete()
    db.commit()


def get_dashboard_stats(db: Session, user_id: int):

    user_detections = db.query(Detection).filter(Detection.user_id == user_id)
    total = user_detections.count()

    helmet = (
        user_detections
        .filter(Detection.result == "with_helmet")
        .count()
    )

    no_helmet = (
        user_detections
        .filter(Detection.result == "without_helmet")
        .count()
    )

    today = (
        user_detections
        .filter(func.date(Detection.created_at) == date.today())
        .count()
    )

    accuracy = round((helmet / total) * 100, 2) if total else 0.0

    # -----------------------------
    # Monthly Trend
    # -----------------------------

    helmet_monthly = [0] * 12
    no_helmet_monthly = [0] * 12

    helmet_rows = (
        user_detections.with_entities(
            extract("month", Detection.created_at),
            func.count(Detection.id),
        )
        .filter(Detection.result == "with_helmet")
        .group_by(extract("month", Detection.created_at))
        .all()
    )

    for month, count in helmet_rows:
        helmet_monthly[int(month) - 1] = count

    no_helmet_rows = (
        user_detections.with_entities(
            extract("month", Detection.created_at),
            func.count(Detection.id),
        )
        .filter(Detection.result == "without_helmet")
        .group_by(extract("month", Detection.created_at))
        .all()
    )

    for month, count in no_helmet_rows:
        no_helmet_monthly[int(month) - 1] = count

    # -----------------------------
    # Detection Sources
    # -----------------------------

    image_count = (
        user_detections
        .filter(Detection.source == "Image Upload")
        .count()
    )

    video_count = (
        user_detections
        .filter(Detection.source == "Video Upload")
        .count()
    )

    camera_count = (
        user_detections
        .filter(Detection.source == "Live Camera")
        .count()
    )

    total_sources = image_count + video_count + camera_count

    if total_sources == 0:
        image_percent = 0
        video_percent = 0
        camera_percent = 0
    else:
        image_percent = round(image_count * 100 / total_sources)
        video_percent = round(video_count * 100 / total_sources)
        camera_percent = round(camera_count * 100 / total_sources)

    return {
        "totalDetections": total,
        "helmetDetected": helmet,
        "noHelmetDetected": no_helmet,
        "todayDetections": today,
        "accuracy": accuracy,

        "trend": {
            "labels": list(month_abbr)[1:],
            "helmet": helmet_monthly,
            "noHelmet": no_helmet_monthly,
        },

        "distribution": {
        "helmet": helmet,
        "noHelmet": no_helmet,
        },

        "sources": {
            "image": image_percent,
            "video": video_percent,
            "camera": camera_percent,
        },
    }
