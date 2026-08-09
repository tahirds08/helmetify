from pathlib import Path
from typing import cast

import cv2
import numpy as np
import onnxruntime as ort


MODEL_PATH = Path("models") / "helmet.onnx"

RESULTS_FOLDER = Path("results")
RESULTS_FOLDER.mkdir(exist_ok=True)

INPUT_SIZE = 640
CONF_THRESHOLD = 0.25
IOU_THRESHOLD = 0.45

CLASS_NAMES = {
    0: "with_helmet",
    1: "without_helmet",
}


session = ort.InferenceSession(
    str(MODEL_PATH),
    providers=["CPUExecutionProvider"],
)

INPUT_NAME = session.get_inputs()[0].name


def preprocess(image: np.ndarray):
    original_height, original_width = image.shape[:2]

    resized = cv2.resize(
        image,
        (INPUT_SIZE, INPUT_SIZE),
    )

    resized = cv2.cvtColor(
        resized,
        cv2.COLOR_BGR2RGB,
    )

    resized = resized.transpose(2, 0, 1)

    resized = resized.astype(np.float32) / 255.0

    resized = np.expand_dims(
        resized,
        axis=0,
    )

    return (
        resized,
        original_width,
        original_height,
    )


def calculate_iou(box1, box2):
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    intersection_width = max(0, x2 - x1)
    intersection_height = max(0, y2 - y1)

    intersection = (
        intersection_width
        * intersection_height
    )

    area1 = (
        max(0, box1[2] - box1[0])
        * max(0, box1[3] - box1[1])
    )

    area2 = (
        max(0, box2[2] - box2[0])
        * max(0, box2[3] - box2[1])
    )

    union = area1 + area2 - intersection

    if union <= 0:
        return 0.0

    return intersection / union


def non_max_suppression(detections):
    if not detections:
        return []

    detections = sorted(
        detections,
        key=lambda item: item["confidence"],
        reverse=True,
    )

    selected = []

    while detections:
        current = detections.pop(0)
        selected.append(current)

        remaining = []

        for detection in detections:
            if (
                detection["class_id"]
                != current["class_id"]
            ):
                remaining.append(detection)
                continue

            iou = calculate_iou(
                current["box"],
                detection["box"],
            )

            if iou < IOU_THRESHOLD:
                remaining.append(detection)

        detections = remaining

    return selected


def run_inference(image: np.ndarray):
    input_tensor, original_width, original_height = preprocess(
        image
    )

    outputs = session.run(
        None,
        {INPUT_NAME: input_tensor},
    )

    predictions = cast(
        np.ndarray,
        outputs[0],
    )

    predictions = predictions[0].T

    scale_x = original_width / INPUT_SIZE
    scale_y = original_height / INPUT_SIZE

    detections = []

    for prediction in predictions:
        x_center = float(prediction[0])
        y_center = float(prediction[1])
        width = float(prediction[2])
        height = float(prediction[3])

        class_scores = prediction[4:]

        class_id = int(
            np.argmax(class_scores)
        )

        confidence = float(
            class_scores[class_id]
        )

        if confidence < CONF_THRESHOLD:
            continue

        x1 = int(
            (x_center - width / 2)
            * scale_x
        )

        y1 = int(
            (y_center - height / 2)
            * scale_y
        )

        x2 = int(
            (x_center + width / 2)
            * scale_x
        )

        y2 = int(
            (y_center + height / 2)
            * scale_y
        )

        x1 = max(0, min(x1, original_width - 1))
        y1 = max(0, min(y1, original_height - 1))
        x2 = max(0, min(x2, original_width - 1))
        y2 = max(0, min(y2, original_height - 1))

        detections.append(
            {
                "box": [x1, y1, x2, y2],
                "confidence": confidence,
                "class_id": class_id,
                "class": CLASS_NAMES.get(
                    class_id,
                    "unknown",
                ),
            }
        )

    return non_max_suppression(detections)


def draw_detections(
    image: np.ndarray,
    detections,
):
    annotated = image.copy()

    for detection in detections:
        x1, y1, x2, y2 = detection["box"]

        class_name = detection["class"]

        confidence = (
            detection["confidence"] * 100
        )

        cv2.rectangle(
            annotated,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2,
        )

        label = (
            f"{class_name} "
            f"{confidence:.2f}%"
        )

        cv2.putText(
            annotated,
            label,
            (x1, max(y1 - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2,
        )

    return annotated


class YOLOService:

    @staticmethod
    def predict(image_path: str):
        image = cv2.imread(image_path)

        if image is None:
            raise ValueError(
                "Unable to read image."
            )

        detections = run_inference(image)

        annotated = draw_detections(
            image,
            detections,
        )

        output_path = (
            RESULTS_FOLDER
            / Path(image_path).name
        )

        cv2.imwrite(
            str(output_path),
            annotated,
        )

        highest_confidence = 0.0
        final_result = "unknown"

        formatted_detections = []

        for detection in detections:
            confidence = (
                detection["confidence"] * 100
            )

            formatted_detections.append(
                {
                    "class": detection["class"],
                    "confidence": round(
                        confidence,
                        2,
                    ),
                }
            )

            if confidence > highest_confidence:
                highest_confidence = confidence
                final_result = detection["class"]

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
            "detections": formatted_detections,
        }

    @staticmethod
    def predict_video(video_path: str):
        output_path = (
            RESULTS_FOLDER
            / Path(video_path).name
        )

        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise ValueError(
                "Unable to open video."
            )

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

                detections = run_inference(frame)

                annotated_frame = draw_detections(
                    frame,
                    detections,
                )

                writer.write(
                    annotated_frame
                )

                for detection in detections:
                    confidence = (
                        detection["confidence"]
                        * 100
                    )

                    if confidence > highest_confidence:
                        highest_confidence = confidence
                        final_result = detection["class"]

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

    @staticmethod
    def predict_camera_frame(
        image_path: str,
    ):
        image = cv2.imread(image_path)

        if image is None:
            raise ValueError(
                "Unable to read camera frame."
            )

        detections = run_inference(image)

        annotated = draw_detections(
            image,
            detections,
        )

        output_path = (
            RESULTS_FOLDER
            / Path(image_path).name
        )

        cv2.imwrite(
            str(output_path),
            annotated,
        )

        highest_confidence = 0.0
        final_result = "unknown"

        helmet_count = 0
        no_helmet_count = 0

        formatted_detections = []

        for detection in detections:
            confidence = (
                detection["confidence"] * 100
            )

            class_name = detection["class"]

            formatted_detections.append(
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
            "detections": formatted_detections,
            "original_image": image_path,
            "annotated_image": str(
                output_path
            ),
        }