'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Clapperboard,
  MessageSquareQuote,
  Radar,
  Sparkles,
  Telescope,
} from 'lucide-react'

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
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const features = [
  {
    icon: MessageSquareQuote,
    title: 'Fast enough for the couch',
    body: 'Log and rate from Telegram in seconds, then let the web app hold the richer layer of notes, posters, and patterns.',
  },
  {
    icon: Radar,
    title: 'Taste that actually compounds',
    body: 'Arc learns from your real watches and ratings, so suggestions and insights feel specific instead of vaguely flattering.',
  },
  {
    icon: Sparkles,
    title: 'A dashboard with a point of view',
    body: 'Your library, stats, and insight pages are designed like a personal cinema journal, not a spreadsheet with posters.',
  },
]

const steps = [
  'Message Arc on Telegram and start logging what you watch.',
  'Link your dashboard once with the six-digit code from /start.',
  'Track patterns, revisit notes, and let Arc sharpen your next pick.',
]

export function HomeLanding({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <main className="min-h-screen overflow-hidden px-6 py-14 sm:py-20">
      <motion.div
        className="mx-auto max-w-6xl space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            variants={item}
            className="arc-panel arc-grid relative overflow-hidden p-7 sm:p-9"
          >
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                <Clapperboard className="size-3.5" />
                Arc
                <span className="h-1 w-1 rounded-full bg-primary" />
                Movie tracking
              </div>

              <h1 className="mt-7 max-w-4xl font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight sm:text-7xl">
                Your movie life,
                <br />
                staged like it matters.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Arc keeps the front door frictionless with Telegram, then turns your history into a cinematic dashboard for ratings, notes, stats, and sharp AI reads grounded in what you actually watch.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="group rounded-full px-6">
                  <Link href={isSignedIn ? '/dashboard' : '/login'}>
                    {isSignedIn ? 'Open dashboard' : 'Sign in to Arc'}
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                  <Link href="/dashboard/settings">Connect Telegram</Link>
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="grid gap-6">
            <div className="arc-panel relative overflow-hidden p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-primary/30" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                  How it flows
                </p>
                <div className="mt-5 space-y-3">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step}
                      variants={item}
                      className="flex gap-4 rounded-[1.5rem] border border-white/10 bg-white/6 p-4"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-7 text-foreground/90">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              variants={item}
              className="arc-panel flex items-center justify-between gap-4 p-6"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Weekly pulse
                </p>
                <p className="mt-3 max-w-xs text-lg leading-8">
                  Digests, stats, and insight pages keep your taste legible over time.
                </p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                <Telescope className="size-6 text-primary" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        <motion.section variants={container} className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              variants={item}
              whileHover={{ y: -6 }}
              className="arc-panel p-6"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                <feature.icon className="size-5 text-primary" />
              </div>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl tracking-tight">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.body}</p>
            </motion.article>
          ))}
        </motion.section>
      </motion.div>
    </main>
  )
}
