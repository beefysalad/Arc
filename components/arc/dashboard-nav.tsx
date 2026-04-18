'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'

import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const navigation = [
  { href: '/dashboard', label: 'Library' },
  { href: '/dashboard/insights', label: 'Insights' },
  { href: '/dashboard/stats', label: 'Stats' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          <Link href="/dashboard" className="text-lg font-semibold tracking-[0.2em] uppercase">
            Arc
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
        <nav className="flex items-center gap-2 overflow-x-auto pb-1">
          {navigation.map((item) => {
            const active = pathname === item.href

            return (
              <motion.div key={item.href} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={item.href}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                    active
                      ? 'bg-white/10 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
