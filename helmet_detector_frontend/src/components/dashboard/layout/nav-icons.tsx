import type { Icon } from '@phosphor-icons/react/dist/lib/types';

import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { CameraIcon } from '@phosphor-icons/react/dist/ssr/Camera';
import { VideoCameraIcon } from '@phosphor-icons/react/dist/ssr/VideoCamera';
import { VideoIcon } from '@phosphor-icons/react/dist/ssr/Video';
import { ClockCounterClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ClockCounterClockwise';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'chart-bar': ChartBarIcon,
  'gear-six': GearSixIcon,
  camera: CameraIcon,
  'video-camera': VideoCameraIcon,
  video: VideoIcon,
  'clock-counter-clockwise': ClockCounterClockwiseIcon,
} as Record<string, Icon>;