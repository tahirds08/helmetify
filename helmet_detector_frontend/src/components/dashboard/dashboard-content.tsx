'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { getDashboardStats } from '@/lib/api';

import { TodayDetections } from '@/components/dashboard/overview/today-detections';
import { HelmetDetected } from '@/components/dashboard/overview/helmet-detected';
import { DetectionAccuracy } from '@/components/dashboard/overview/detection-accuracy';
import { NoHelmetDetected } from '@/components/dashboard/overview/no-helmet-detected';
import { DetectionTrend } from '@/components/dashboard/overview/detection-trend';
import { DetectionSources } from '@/components/dashboard/overview/detection-sources';

interface DashboardStats {
  todayDetections: number;
  helmetDetected: number;
  noHelmetDetected: number;
  accuracy: number;

  trend: {
    labels: string[];
    helmet: number[];
    noHelmet: number[];
  };

  distribution: {
    helmet: number;
    noHelmet: number;
  };
}

export function DashboardContent(): React.JSX.Element {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);

  async function loadDashboard() {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  }

  React.useEffect(() => {
    loadDashboard();
  }, []);

  if (!stats) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Cards */}

      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <TodayDetections
          value={stats.todayDetections.toString()}
          diff={0}
          trend="up"
          sx={{ height: '100%' }}
        />
      </Grid>

      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <HelmetDetected
          value={stats.helmetDetected.toString()}
          diff={0}
          trend="up"
          sx={{ height: '100%' }}
        />
      </Grid>

      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <DetectionAccuracy
          value={stats.accuracy}
          sx={{ height: '100%' }}
        />
      </Grid>

      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <NoHelmetDetected
          value={stats.noHelmetDetected.toString()}
          sx={{ height: '100%' }}
        />
      </Grid>

      {/* Trend Chart */}

      <Grid size={{ lg: 8, xs: 12 }}>
        <DetectionTrend
          labels={stats.trend.labels}
          chartSeries={[
            {
              name: 'Helmet',
              data: stats.trend.helmet,
            },
            {
              name: 'No Helmet',
              data: stats.trend.noHelmet,
            },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>

      {/* Pie Chart */}

      <Grid size={{ lg: 4, xs: 12 }}>
        <DetectionSources
          labels={['Helmet', 'No Helmet']}
          chartSeries={[
            stats.distribution.helmet,
            stats.distribution.noHelmet,
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}