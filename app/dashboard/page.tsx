import type { Metadata } from 'next'

import { MovieDashboard } from '@/components/arc/movie-dashboard'

export const metadata: Metadata = {
  title: 'Library',
}

export default function DashboardPage() {
  return <MovieDashboard />
}
