from pathlib import Path
from typing import Any, cast

import cv2
from ultralytics import YOLO


MODEL_PATH = Path("models") / "helmet.pt"

RESULTS_FOLDER = Path("results")
RESULTS_FOLDER.mkdir(exist_ok=True)

model = YOLO(str(MODEL_PATH))


class YOLOService:

    # ============================================================
    # IMAGE DETECTION
    # ============================================================

    @staticmethod
    def predict(image_path: str):

        results = model.predict(
            source=image_path,
            save=False,
            conf=0.25,
            verbose=False,
        )

        result = cast(Any, next(iter(results)))

        output_path = RESULTS_FOLDER / Path(image_path).name

        annotated = result.plot()

        cv2.imwrite(
            str(output_path),
            annotated,
        )

        highest_confidence = 0.0
        final_result = "unknown"

        detections = []

        if result.boxes is not None:

            boxes = result.boxes

            for i in range(len(boxes.cls)):

                confidence = (
                    float(boxes.conf[i].item()) * 100
                )

                class_id = int(
                    boxes.cls[i].item()
                )

                class_name = result.names[class_id]

                detections.append(
                    {
                        "class": class_name,
                        "confidence": round(
                            confidence,
                            2,
                        ),
                    }
                )

                if confidence > highest_confidence:

                    highest_confidence = confidence
                    final_result = class_name

        return {
            "result": final_result,
            "confidence": round(
                highest_confidence,
                2,
            ),
            "original_image": image_path,
            "annotated_image": str(output_path),
            "detections": detections,
        }

    # ============================================================
    # VIDEO DETECTION
    # ============================================================

    @staticmethod
    def predict_video(video_path: str):

        output_path = RESULTS_FOLDER / Path(video_path).name

        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise Exception("Unable to open video.")

        width = int(
            cap.get(cv2.CAP_PROP_FRAME_WIDTH)
        )

        height = int(
            cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
        )

        fps = cap.get(cv2.CAP_PROP_FPS)

        if fps <= 0:
            fps = 25.0

        writer = cv2.VideoWriter(
            str(output_path),
            cv2.VideoWriter.fourcc(*"mp4v"),
            fps,
            (width, height),
        )

        highest_confidence = 0.0
        final_result = "unknown"

        try:

            while True:

                success, frame = cap.read()

                if not success:
                    break

                results = model.predict(
                    source=frame,
                    save=False,
                    conf=0.25,
                    verbose=False,
                )

                result = cast(
                    Any,
                    next(iter(results)),
                )

                annotated_frame = result.plot()

                writer.write(
                    annotated_frame
                )

                if result.boxes is not None:

                    boxes = result.boxes

                    for i in range(
                        len(boxes.cls)
                    ):

                        confidence = (
                            float(
                                boxes.conf[i].item()
                            )
                            * 100
                        )

                        if confidence > highest_confidence:

                            highest_confidence = confidence

                            class_id = int(
                                boxes.cls[i].item()
                            )

                            final_result = (
                                result.names[
                                    class_id
                                ]
                            )

        finally:

            cap.release()
            writer.release()

        return {
            "result": final_result,
            "confidence": round(
                highest_confidence,
                2,
            ),
            "original_video": video_path,
            "annotated_video": str(
                output_path
            ),
        }

    # ============================================================
    # LIVE CAMERA FRAME DETECTION
    # ============================================================

    @staticmethod
    def predict_camera_frame(
        image_path: str,
    ):

        # Camera frames are processed exactly
        # like uploaded images.

        results = model.predict(
            source=image_path,
            save=False,
            conf=0.25,
            verbose=False,
        )

        result = cast(
            Any,
            next(iter(results)),
        )

        # Save annotated camera frame
        output_path = RESULTS_FOLDER / Path(image_path).name

        annotated = result.plot()

        cv2.imwrite(
            str(output_path),
            annotated,
        )

        highest_confidence = 0.0
        final_result = "unknown"

        detections = []

        helmet_count = 0
        no_helmet_count = 0

        if result.boxes is not None:

            boxes = result.boxes

            for i in range(
                len(boxes.cls)
            ):

                confidence = (
                    float(
                        boxes.conf[i].item()
                    )
                    * 100
                )

                class_id = int(
                    boxes.cls[i].item()
                )

                class_name = result.names[
                    class_id
                ]

                detections.append(
                    {
                        "class": class_name,
                        "confidence": round(
                            confidence,
                            2,
                        ),
                    }
                )

                if class_name == "with_helmet":

                    helmet_count += 1

                elif class_name == "without_helmet":

                    no_helmet_count += 1

                if confidence > highest_confidence:

                    highest_confidence = confidence
                    final_result = class_name

        return {
            "result": final_result,
            "confidence": round(
                highest_confidence,
                2,
            ),
            "helmet_count": helmet_count,
            "no_helmet_count": no_helmet_count,
            "detections": detections,
            "original_image": image_path,
            "annotated_image": str(output_path),
        }