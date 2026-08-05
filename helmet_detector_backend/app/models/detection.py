from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class Detection(Base):
    __tablename__ = "helmet_detection_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    source = Column(
        String,
        default="Image Upload",
        nullable=False,
    )

    result = Column(String, nullable=False)

    confidence = Column(Float, nullable=False)

    # Image paths
    original_image = Column(String, nullable=True)
    annotated_image = Column(String, nullable=True)

    # Video paths
    original_video = Column(String, nullable=True)
    annotated_video = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
