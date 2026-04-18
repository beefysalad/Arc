import type { Metadata } from 'next'

import { SettingsDashboard } from '@/components/arc/settings-dashboard'

export const metadata: Metadata = {
  title: 'Settings',
}

export default function DashboardSettingsPage() {
  return <SettingsDashboard />
}

