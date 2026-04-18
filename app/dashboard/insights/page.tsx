import type { Metadata } from 'next'

import { InsightsDashboard } from '@/components/arc/insights-dashboard'

export const metadata: Metadata = {
  title: 'Insights',
}

export default function DashboardInsightsPage() {
  return <InsightsDashboard />
}

