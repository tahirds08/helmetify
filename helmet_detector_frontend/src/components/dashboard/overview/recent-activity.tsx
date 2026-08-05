import * as React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import type { SxProps } from '@mui/material/styles';

import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';

import dayjs from 'dayjs';

const resultMap = {
  helmet: {
    label: 'Helmet',
    color: 'success',
  },

  nohelmet: {
    label: 'No Helmet',
    color: 'error',
  },
} as const;

export interface DetectionActivity {
  id: string;
  source: string;
  confidence: number;
  result: 'helmet' | 'nohelmet';
  detectedAt: Date;
}

export interface RecentActivityProps {
  activities?: DetectionActivity[];
  sx?: SxProps;
}

export function RecentActivity({
  activities = [],
  sx,
}: RecentActivityProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title="Recent Detection Activity" />

      <Divider />

      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Result</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {activities.map((activity) => {
              const { label, color } =
                resultMap[activity.result];

              return (
                <TableRow hover key={activity.id}>
                  <TableCell>
                    {activity.id}
                  </TableCell>

                  <TableCell>
                    {activity.source}
                  </TableCell>

                  <TableCell>
                    {activity.confidence}%
                  </TableCell>

                  <TableCell>
                    {dayjs(activity.detectedAt).format(
                      'MMM D, YYYY HH:mm'
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      color={color}
                      label={label}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Divider />

      <CardActions
        sx={{ justifyContent: 'flex-end' }}
      >
        <Button
          color="inherit"
          variant="text"
          size="small"
          endIcon={<ArrowRightIcon />}
        >
          View All
        </Button>
      </CardActions>
    </Card>
  );
}