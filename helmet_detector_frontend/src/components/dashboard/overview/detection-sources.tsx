'use client';

import * as React from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

import { ShieldCheckIcon } from '@phosphor-icons/react/dist/ssr/ShieldCheck';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';

import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

export interface DetectionSourcesProps {
  chartSeries: number[];
  labels: string[];
  sx?: SxProps;
}

export function DetectionSources({
  chartSeries,
  labels,
  sx,
}: DetectionSourcesProps): React.JSX.Element {
  const chartOptions = useChartOptions(labels);

  return (
    <Card sx={sx}>
      <CardHeader title="Helmet vs No Helmet" />

      <CardContent>
        <Stack spacing={3}>
          <Chart
            type="donut"
            height={300}
            width="100%"
            options={chartOptions}
            series={chartSeries}
          />

          <Stack
            direction="row"
            justifyContent="center"
            spacing={6}
          >
            <Stack alignItems="center" spacing={1}>
              <ShieldCheckIcon
                color="green"
                fontSize="var(--icon-fontSize-xl)"
              />

              <Typography variant="subtitle1">
                Helmet
              </Typography>

              <Typography color="text.secondary">
                {chartSeries[0]}
              </Typography>
            </Stack>

            <Stack alignItems="center" spacing={1}>
              <WarningCircleIcon
                color="red"
                fontSize="var(--icon-fontSize-xl)"
              />

              <Typography variant="subtitle1">
                No Helmet
              </Typography>

              <Typography color="text.secondary">
                {chartSeries[1]}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
    },

    labels,

    colors: [
      theme.palette.success.main,
      theme.palette.error.main,
    ],

    legend: {
      show: false,
    },

    stroke: {
      width: 0,
    },

    dataLabels: {
      enabled: true,
    },

    tooltip: {
      fillSeriesColor: false,
    },

    theme: {
      mode: theme.palette.mode,
    },
  };
}