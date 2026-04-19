'use client'

import { useState } from 'react'
import { differenceInHours } from 'date-fns'
import { motion } from 'framer-motion'
import { Compass, Lightbulb, MessageSquareQuote, ScanSearch, Sparkles } from 'lucide-react'

import { PageIntro } from '@/components/arc/page-intro'
import { fadeUp, stagger } from '@/components/arc/motion-primitives'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useInsights } from '@/hooks/use-arc'
import { INSIGHT_CACHE_HOURS } from '@/lib/arc/constants'

export function InsightsDashboard() {
  const [force, setForce] = useState(false)
  const { data, isLoading, isFetching } = useInsights(force)

  if (isLoading || !data) {
    return <div className="text-muted-foreground">Loading insights...</div>
  }

  const hoursSinceRefresh = data.lastInsightAt
    ? differenceInHours(new Date(), new Date(data.lastInsightAt))
    : INSIGHT_CACHE_HOURS
  const canRefresh = !data.lastInsightAt || hoursSinceRefresh >= INSIGHT_CACHE_HOURS
  const hoursRemaining = Math.max(0, INSIGHT_CACHE_HOURS - hoursSinceRefresh)

  function handleRefresh() {
    setForce(true)
  }

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show">
      <PageIntro
        eyebrow="Arc Insights"
        title="A sharper read on your taste than a year-end recap ever gives you."
        description="These reads stay tied to your actual history, so they land more like a smart friend spotting a pattern than a generic AI horoscope."
        aside={
          <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Insight cache</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight">
              {canRefresh ? 'Ready' : `${hoursRemaining}h`}
            </p>
            <Button
              onClick={handleRefresh}
              disabled={!canRefresh || isFetching}
              className="mt-5 rounded-full"
            >
              {canRefresh ? (isFetching ? 'Refreshing...' : 'Regenerate') : `Refreshes in ${hoursRemaining}h`}
            </Button>
          </div>
        }
      />

      <motion.section variants={fadeUp}>
        <Card className="arc-panel p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/20 to-rose-400/15">
              <MessageSquareQuote className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Your taste in a nutshell</p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                Summary
              </h2>
            </div>
          </div>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-foreground/90">{data.summary}</p>
        </Card>
      </motion.section>

      <motion.section variants={stagger} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={fadeUp}>
          <Card className="arc-panel h-full bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                <ScanSearch className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Blind spot</p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                  What you are strangely missing
                </h2>
              </div>
            </div>
            <p className="mt-6 text-lg leading-8">{data.blindSpot}</p>
          </Card>
        </motion.div>

        <motion.div variants={stagger} className="grid gap-4 md:grid-cols-3">
          {data.patterns.map((pattern, index) => (
            <motion.div key={pattern} variants={fadeUp} whileHover={{ y: -6 }}>
              <Card className="arc-panel h-full p-5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/18 to-sky-400/18">
                  {index === 0 ? (
                    <Sparkles className="size-4" />
                  ) : index === 1 ? (
                    <Lightbulb className="size-4" />
                  ) : (
                    <Compass className="size-4" />
                  )}
                </div>
                <p className="mt-5 text-base leading-7">{pattern}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section variants={fadeUp}>
        <Card className="arc-panel p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/20 to-sky-400/20">
              <Compass className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Next watch</p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                One pick with a reason
              </h2>
            </div>
          </div>
          <p className="mt-6 text-lg leading-8 text-foreground/90">{data.nextWatch}</p>
        </Card>
      </motion.section>
    </motion.div>
  )
}
