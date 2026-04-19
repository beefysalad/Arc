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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.15),transparent_28%),radial-gradient(circle_at_16%_18%,rgba(248,113,113,0.12),transparent_24%),radial-gradient(circle_at_82%_8%,rgba(56,189,248,0.14),transparent_24%),var(--background)]">
      <DashboardNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
