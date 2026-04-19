'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Clapperboard,
  MessageSquareQuote,
  Radar,
  Sparkles,
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

const proof = [
  { label: 'Bot-first logging', value: '/log /rate /search' },
  { label: 'Personal history', value: 'posters, notes, ratings' },
  { label: 'Taste feedback', value: 'stats, insights, weekly digests' },
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
            <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
            <div className="relative">
              <div className="arc-chip">
                <Clapperboard className="size-3.5" />
                Arc
                <span className="h-1 w-1 rounded-full bg-primary" />
                Movie system
              </div>

              <h1 className="mt-7 max-w-5xl font-[family-name:var(--font-display)] text-5xl leading-[0.9] tracking-tight sm:text-7xl">
                A harder,
                <br />
                cleaner home
                <br />
                for what you watch.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Arc keeps the front door fast with Telegram, then turns your watch history into a sharp black-and-gold control room for ratings, notes, stats, and recommendations grounded in your real behavior.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="group rounded-full px-6 font-semibold">
                  <Link href={isSignedIn ? '/dashboard' : '/login'}>
                    {isSignedIn ? 'Open dashboard' : 'Sign in to Arc'}
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/12 bg-[#111111] px-6">
                  <Link href="/dashboard/settings">Connect Telegram</Link>
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="grid gap-6">
            <div className="arc-panel relative overflow-hidden p-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                  Command board
                </p>
                <div className="mt-5 space-y-3">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step}
                      variants={item}
                      className="flex gap-4 rounded-[1.35rem] border border-white/10 bg-black/30 p-4"
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
              className="grid gap-4 sm:grid-cols-3"
            >
              {proof.map((item) => (
                <div key={item.label} className="arc-panel p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-3 text-base leading-7">{item.value}</p>
                </div>
              ))}
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
