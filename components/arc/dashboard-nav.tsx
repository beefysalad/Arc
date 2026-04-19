'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Clapperboard, LibraryBig, LineChart, Settings2, Sparkles } from 'lucide-react'

import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const navigation = [
  { href: '/dashboard', label: 'Library', icon: LibraryBig },
  { href: '/dashboard/insights', label: 'Insights', icon: Sparkles },
  { href: '/dashboard/stats', label: 'Stats', icon: LineChart },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings2 },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/75 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-orange-400/25 via-rose-400/15 to-sky-400/20 shadow-[0_12px_32px_rgba(251,146,60,0.18)]">
              <Clapperboard className="size-5 text-foreground" />
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl leading-none tracking-tight">
                Arc
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Movie companion
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="rounded-full border border-white/10 bg-white/6 p-1">
              <UserButton />
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto pb-1">
          {navigation.map((item) => {
            const active = pathname === item.href

            return (
              <motion.div key={item.href} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-all',
                    active
                      ? 'bg-foreground text-background shadow-[0_18px_38px_rgba(15,23,42,0.18)]'
                      : 'border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                  )}
                >
                  <item.icon className="size-4" />
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
