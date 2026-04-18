import type { Metadata } from 'next'

import { DashboardNav } from '@/components/arc/dashboard-nav'
import { ARC_TITLE } from '@/lib/arc/constants'
import { userService } from '@/lib/services/user-service'

export const metadata: Metadata = {
  title: {
    default: `${ARC_TITLE} Dashboard`,
    template: `%s · ${ARC_TITLE}`,
  },
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await userService.syncCurrentUserToDatabase()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.12),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.08),transparent_24%),var(--background)]">
      <DashboardNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

