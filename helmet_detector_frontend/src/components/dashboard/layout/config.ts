import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.overview,
    icon: 'chart-pie',
  },
  {
    key: 'image-detection',
    title: 'Image Detection',
    href: '/dashboard/image-detection',
    icon: 'camera',
  },
  {
    key: 'video-detection',
    title: 'Video Detection',
    href: '/dashboard/video-detection',
    icon: 'video-camera',
  },
  {
    key: 'live-camera',
    title: 'Live Camera',
    href: '/dashboard/live-camera',
    icon: 'video',
  },
  {
    key: 'history',
    title: 'History',
    href: '/dashboard/history',
    icon: 'clock-counter-clockwise',
  },
  {
    key: 'settings',
    title: 'Settings',
    href: '/dashboard/settings',
    icon: 'gear-six',
  },
] satisfies NavItemConfig[];