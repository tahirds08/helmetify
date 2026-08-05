import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ShieldCheckIcon } from '@phosphor-icons/react/dist/ssr/ShieldCheck';

export interface HelmetDetectedProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
  value: string;
}

export function HelmetDetected({
  diff,
  trend,
  sx,
  value,
}: HelmetDetectedProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;

  const trendColor =
    trend === 'up'
      ? 'var(--mui-palette-success-main)'
      : 'var(--mui-palette-error-main)';

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={3}
            sx={{
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <Stack spacing={1}>
              <Typography
                color="text.secondary"
                variant="overline"
              >
                Helmet Detected
              </Typography>

              <Typography variant="h4">
                {value}
              </Typography>
            </Stack>

            <Avatar
              sx={{
                backgroundColor: 'var(--mui-palette-success-main)',
                width: 56,
                height: 56,
              }}
            >
              <ShieldCheckIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>

          {diff ? (
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center' }}
            >
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center' }}
              >
                <TrendIcon
                  color={trendColor}
                  fontSize="var(--icon-fontSize-md)"
                />

                <Typography
                  color={trendColor}
                  variant="body2"
                >
                  {diff}%
                </Typography>
              </Stack>

              <Typography
                color="text.secondary"
                variant="caption"
              >
                Compared to yesterday
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}