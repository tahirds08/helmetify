from ultralytics import YOLO

model = YOLO("yolo11n.pt")

model.train(
    data="ai_training/datasets/data.yaml",
    epochs=50,
    imgsz=640,
    batch=8,
    name="helmet_detector",
    workers=0
)