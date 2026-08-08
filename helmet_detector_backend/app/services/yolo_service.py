from pathlib import Path
from typing import Any, cast
import gc

import cv2
from ultralytics import YOLO


MODEL_PATH = Path("models") / "helmet.pt"

RESULTS_FOLDER = Path("results")
RESULTS_FOLDER.mkdir(exist_ok=True)

# Load the model only once.
model = YOLO(str(MODEL_PATH))


# ============================================================
# HELPERS
# ============================================================

def get_result(results: Any) -> Any:
    """
    Safely get the first YOLO result.

    Using next(iter(results)) instead of results[0]
    avoids Pylance type errors with Ultralytics.
    """
    return cast(Any, next(iter(results)))


def resize_image(image: Any, max_size: int = 1280) -> Any:
    """
    Resize very large images before YOLO inference.
    This significantly reduces memory usage.
    """

    height, width = image.shape[:2]

    largest_dimension = max(height, width)

    if largest_dimension <= max_size:
        return image

    scale = max_size / largest_dimension

    new_width = int(width * scale)
    new_height = int(height * scale)

    return cv2.resize(
        image,
        (new_width, new_height),
        interpolation=cv2.INTER_AREA,
    )


def extract_detection_data(result: Any) -> tuple[
    str,
    float,
    list[dict[str, Any]],
]:
    """
    Extract detection information from a YOLO result.
    """

    highest_confidence = 0.0
    final_result = "unknown"

    detections: list[dict[str, Any]] = []

    if result.boxes is None:
        return (
            final_result,
            highest_confidence,
            detections,
        )

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

    return (
        final_result,
        highest_confidence,
        detections,
    )


# ============================================================
# YOLO SERVICE
# ============================================================

class YOLOService:

    # ========================================================
    # IMAGE DETECTION
    # ========================================================

    @staticmethod
    def predict(image_path: str):

        image = cv2.imread(image_path)

        if image is None:
            raise Exception(
                "Unable to read uploaded image."
            )

        # Resize large images before inference.
        image = resize_image(
            image,
            max_size=1280,
        )

        try:

            results = model.predict(
                source=image,
                save=False,
                conf=0.25,
                imgsz=640,
                verbose=False,
                device="cpu",
            )

            result = get_result(results)

            output_path = (
                RESULTS_FOLDER
                / Path(image_path).name
            )

            annotated = result.plot()

            cv2.imwrite(
                str(output_path),
                annotated,
            )

            (
                final_result,
                highest_confidence,
                detections,
            ) = extract_detection_data(result)

            return {
                "result": final_result,
                "confidence": round(
                    highest_confidence,
                    2,
                ),
                "original_image": image_path,
                "annotated_image": str(
                    output_path
                ),
                "detections": detections,
            }

        finally:

            # Release temporary OpenCV/YOLO objects.
            del image

            gc.collect()

    # ========================================================
    # VIDEO DETECTION
    # ========================================================

    @staticmethod
    def predict_video(video_path: str):

        output_path = (
            RESULTS_FOLDER
            / Path(video_path).name
        )

        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise Exception(
                "Unable to open video."
            )

        width = int(
            cap.get(
                cv2.CAP_PROP_FRAME_WIDTH
            )
        )

        height = int(
            cap.get(
                cv2.CAP_PROP_FRAME_HEIGHT
            )
        )

        fps = cap.get(
            cv2.CAP_PROP_FPS
        )

        if fps <= 0:
            fps = 25.0

        # Limit output resolution.
        max_video_size = 1280

        if max(width, height) > max_video_size:

            scale = (
                max_video_size
                / max(width, height)
            )

            width = int(width * scale)
            height = int(height * scale)

        writer = cv2.VideoWriter(
            str(output_path),
            cv2.VideoWriter.fourcc(
                *"mp4v"
            ),
            fps,
            (width, height),
        )

        highest_confidence = 0.0
        final_result = "unknown"

        frame_count = 0

        try:

            while True:

                success, frame = cap.read()

                if not success:
                    break

                frame_count += 1

                # Resize frame if necessary.
                frame = resize_image(
                    frame,
                    max_size=1280,
                )

                # Keep frame dimensions consistent
                # with the video writer.
                frame = cv2.resize(
                    frame,
                    (width, height),
                    interpolation=cv2.INTER_AREA,
                )

                # Process every frame.
                results = model.predict(
                    source=frame,
                    save=False,
                    conf=0.25,
                    imgsz=640,
                    verbose=False,
                    device="cpu",
                )

                result = get_result(results)

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
                                boxes.conf[
                                    i
                                ].item()
                            )
                            * 100
                        )

                        if (
                            confidence
                            > highest_confidence
                        ):

                            highest_confidence = (
                                confidence
                            )

                            class_id = int(
                                boxes.cls[
                                    i
                                ].item()
                            )

                            final_result = (
                                result.names[
                                    class_id
                                ]
                            )

                # Explicitly release frame data.
                del frame
                del results
                del result
                del annotated_frame

                # Periodic garbage collection.
                if frame_count % 30 == 0:
                    gc.collect()

        finally:

            cap.release()
            writer.release()

            gc.collect()

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

    # ========================================================
    # LIVE CAMERA FRAME DETECTION
    # ========================================================

    @staticmethod
    def predict_camera_frame(
        image_path: str,
    ):

        image = cv2.imread(image_path)

        if image is None:
            raise Exception(
                "Unable to read camera frame."
            )

        image = resize_image(
            image,
            max_size=1280,
        )

        try:

            results = model.predict(
                source=image,
                save=False,
                conf=0.25,
                imgsz=640,
                verbose=False,
                device="cpu",
            )

            result = get_result(results)

            output_path = (
                RESULTS_FOLDER
                / Path(image_path).name
            )

            annotated = result.plot()

            cv2.imwrite(
                str(output_path),
                annotated,
            )

            highest_confidence = 0.0
            final_result = "unknown"

            detections: list[
                dict[str, Any]
            ] = []

            helmet_count = 0
            no_helmet_count = 0

            if result.boxes is not None:

                boxes = result.boxes

                for i in range(
                    len(boxes.cls)
                ):

                    confidence = (
                        float(
                            boxes.conf[
                                i
                            ].item()
                        )
                        * 100
                    )

                    class_id = int(
                        boxes.cls[
                            i
                        ].item()
                    )

                    class_name = (
                        result.names[
                            class_id
                        ]
                    )

                    detections.append(
                        {
                            "class": class_name,
                            "confidence": round(
                                confidence,
                                2,
                            ),
                        }
                    )

                    if (
                        class_name
                        == "with_helmet"
                    ):
                        helmet_count += 1

                    elif (
                        class_name
                        == "without_helmet"
                    ):
                        no_helmet_count += 1

                    if (
                        confidence
                        > highest_confidence
                    ):

                        highest_confidence = (
                            confidence
                        )

                        final_result = (
                            class_name
                        )

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
                "annotated_image": str(
                    output_path
                ),
            }

        finally:

            del image

            gc.collect()