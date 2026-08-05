'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

export interface DetectionTrendProps {
  chartSeries: { name: string; data: number[] }[];
  labels: string[];
  sx?: SxProps;
}

export function DetectionTrend({
  chartSeries,
  labels,
  sx,
}: DetectionTrendProps): React.JSX.Element {
  const chartOptions = useChartOptions(labels);

  return (
    <Card sx={sx}>
      <CardHeader
        title="Helmet Detection Trend"
        subheader="Last 12 months"
      />

      <CardContent>
        <Chart
          type="bar"
          height={350}
          width="100%"
          options={chartOptions}
          series={chartSeries}
        />
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false,
      },
    },

    colors: [
      theme.palette.success.main,
      theme.palette.error.main,
    ],

    dataLabels: {
      enabled: false,
    },

    fill: {
      opacity: 1,
      type: 'solid',
    },

    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
    },

    legend: {
      show: true,
    },

    plotOptions: {
      bar: {
        columnWidth: '40%',
      },
    },

    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },

    theme: {
      mode: theme.palette.mode,
    },

    xaxis: {
      categories: labels,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },

    yaxis: {
      title: {
        text: 'Detections',
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
  };
}