import type { Metadata } from 'next'

import { StatsDashboard } from '@/components/arc/stats-dashboard'

export const metadata: Metadata = {
  title: 'Stats',
}

export default function DashboardStatsPage() {
  return <StatsDashboard />
}

