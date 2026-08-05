import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { TargetIcon } from '@phosphor-icons/react/dist/ssr/Target';

export interface DetectionAccuracyProps {
  sx?: SxProps;
  value: number;
}

export function DetectionAccuracy({
  value,
  sx,
}: DetectionAccuracyProps): React.JSX.Element {
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
                Detection Accuracy
              </Typography>

              <Typography variant="h4">
                {value}%
              </Typography>
            </Stack>

            <Avatar
              sx={{
                backgroundColor: 'var(--mui-palette-warning-main)',
                width: 56,
                height: 56,
              }}
            >
              <TargetIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>

          <LinearProgress
            value={value}
            variant="determinate"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}