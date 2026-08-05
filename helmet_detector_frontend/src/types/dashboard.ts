export interface DashboardData {
  todayDetections: number;
  helmetDetected: number;
  noHelmetDetected: number;
  accuracy: number;

  trend: {
    today: {
      diff: number;
      direction: "up" | "down";
    };

    helmet: {
      diff: number;
      direction: "up" | "down";
    };
  };

  monthlyHelmet: number[];
  monthlyNoHelmet: number[];
}