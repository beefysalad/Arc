'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Film, MessageSquareText, Sparkles, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const features = [
  {
    icon: MessageSquareText,
    title: 'Bot-first logging',
    body: 'Use /start, /log, /rate, /suggest, and /stats without adding any UI friction to the moment you pick a movie.',
  },
  {
    icon: Film,
    title: 'A cleaner library',
    body: 'Arc turns Telegram messages into a visual shelf with posters, notes, ratings, and detailed editing when you want it.',
  },
  {
    icon: Sparkles,
    title: 'Taste that evolves',
    body: 'Insights and suggestions stay grounded in what you actually watched instead of drifting into vague AI filler.',
  },
  {
    icon: Star,
    title: 'Weekly memory',
    body: 'Digests and stats help you see streaks, genre gravity, and the shape of your ratings over time.',
  },
]

const flow = [
  'Send /start and Arc gives you a one-time link code in chat.',
  'Log films and ratings with commands when speed matters.',
  'Jump to the dashboard for drawers, notes, insights, and weekly patterns.',
]

export function HomeLanding({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%),var(--background)] px-6 py-14 sm:py-20">
      <motion.div
        className="mx-auto max-w-6xl space-y-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <motion.div variants={item} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground backdrop-blur">
              Arc
              <span className="h-1 w-1 rounded-full bg-sky-300" />
              Movie tracking
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-none tracking-tight sm:text-7xl">
              A sharper home for everything you watch.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Arc keeps the front door simple with Telegram commands, then gives you a richer dashboard for ratings, notes, stats, and grounded AI taste reads.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isSignedIn ? (
                <Button asChild size="lg" className="group rounded-full px-6">
                  <Link href="/dashboard">
                    Open dashboard
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="group rounded-full px-6">
                  <Link href="/login">
                    Sign in
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link href="/dashboard/settings">Connect Telegram</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_30%)]" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Flow</p>
              <div className="mt-4 space-y-3">
                {flow.map((step, index) => (
                  <motion.div
                    key={step}
                    variants={item}
                    className="flex gap-3 rounded-[1.25rem] border border-white/10 bg-black/12 p-4"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-foreground/90">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section
          variants={container}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              variants={item}
              whileHover={{ y: -6 }}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/8">
                <feature.icon className="size-5 text-sky-300" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.body}</p>
            </motion.article>
          ))}
        </motion.section>
      </motion.div>
    </main>
  )
}

