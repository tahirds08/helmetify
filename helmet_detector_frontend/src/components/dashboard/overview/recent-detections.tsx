import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import type { SxProps } from '@mui/material/styles';

import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';

import dayjs from 'dayjs';

export interface Detection {
  id: string;
  image: string;
  name: string;
  detectedAt: Date;
}

export interface RecentDetectionsProps {
  detections?: Detection[];
  sx?: SxProps;
}

export function RecentDetections({
  detections = [],
  sx,
}: RecentDetectionsProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title="Recent Detections" />

      <Divider />

      <List>
        {detections.map((detection, index) => (
          <ListItem
            key={detection.id}
            divider={index < detections.length - 1}
          >
            <ListItemAvatar>
              {detection.image ? (
                <Box
                  component="img"
                  src={detection.image}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    backgroundColor:
                      'var(--mui-palette-neutral-200)',
                  }}
                />
              )}
            </ListItemAvatar>

            <ListItemText
              primary={detection.name}
              secondary={`Detected ${dayjs(
                detection.detectedAt
              ).format('MMM D, YYYY')}`}
              primaryTypographyProps={{
                variant: 'subtitle1',
              }}
              secondaryTypographyProps={{
                variant: 'body2',
              }}
            />

            <IconButton edge="end">
              <DotsThreeVerticalIcon weight="bold" />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <CardActions
        sx={{ justifyContent: 'flex-end' }}
      >
        <Button
          color="inherit"
          size="small"
          variant="text"
          endIcon={<ArrowRightIcon />}
        >
          View All
        </Button>
      </CardActions>
    </Card>
  );
}