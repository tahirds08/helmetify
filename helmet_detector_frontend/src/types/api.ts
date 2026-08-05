export interface DetectionHistory {
  id: number;
  source: string;
  result: string;
  confidence: number;

  original_image: string | null;
  annotated_image: string | null;

  original_video: string | null;
  annotated_video: string | null;

  created_at: string;
}

export interface ImagePrediction {
  result: string;
  confidence: number;

  original_image: string;
  annotated_image: string;
}

export interface ImageDetectionResponse {
  success: boolean;
  prediction: ImagePrediction;
}

export interface VideoPrediction {
  result: string;
  confidence: number;

  original_video: string;
  annotated_video: string;

  frames_processed?: number;
  helmet_count?: number;
  no_helmet_count?: number;
  processing_time?: number;
}

export interface VideoDetectionResponse {
  success: boolean;
  prediction: VideoPrediction;
}

export interface CameraPrediction {
  result: string;
  confidence: number;

  frames_processed: number;
  helmet_count: number;
  no_helmet_count: number;
  processing_time: number;
}

export interface CameraDetectionResponse {
  success: boolean;
  prediction: CameraPrediction;
}

export interface DashboardTrend {
  labels: string[];
  helmet: number[];
  noHelmet: number[];
}

export interface DashboardSources {
  image: number;
  video: number;
  camera: number;
}

export interface DashboardDistribution {
  helmet: number;
  noHelmet: number;
}

export interface DashboardStats {
  totalDetections: number;
  helmetDetected: number;
  noHelmetDetected: number;
  todayDetections: number;
  accuracy: number;

  trend: DashboardTrend;

  sources: DashboardSources;

  distribution?: DashboardDistribution;
}