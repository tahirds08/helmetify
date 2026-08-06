import type { Metadata } from 'next';
import React from 'react';

import { config } from '@/config';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export const metadata = {
  title: `Dashboard | ${config.site.name}`,
} satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <DashboardContent />;
}