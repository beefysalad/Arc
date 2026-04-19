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
        title="Not a horoscope. A sharper read on the way you actually choose."
        description="This page should feel like a taste memo written from your own history: what you favor, what you avoid, and what blind spot keeps showing up."
        aside={
          <div className="arc-panel p-5">
            <p className="arc-chip">Insight cache</p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight">
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

      <motion.section variants={stagger} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div variants={fadeUp} className="grid gap-6">
          <Card className="arc-panel p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                <MessageSquareQuote className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Summary</p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                  Your taste in one pass
                </h2>
              </div>
            </div>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-foreground/90">{data.summary}</p>
          </Card>

          <Card className="arc-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                <ScanSearch className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Blind spot</p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                  What you keep overlooking
                </h2>
              </div>
            </div>
            <p className="mt-6 text-lg leading-8">{data.blindSpot}</p>
          </Card>
        </motion.div>

        <motion.div variants={stagger} className="grid gap-6">
          <motion.div variants={fadeUp}>
            <Card className="arc-panel p-6">
              <p className="arc-chip">Pattern board</p>
              <div className="mt-6 grid gap-4">
                {data.patterns.map((pattern, index) => (
                  <div
                    key={pattern}
                    className="rounded-[1.35rem] border border-white/10 bg-black/25 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex size-9 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                          {index === 0 ? (
                            <Sparkles className="size-4 text-primary" />
                          ) : index === 1 ? (
                            <Lightbulb className="size-4 text-primary" />
                          ) : (
                            <Compass className="size-4 text-primary" />
                          )}
                        </div>
                        <p className="mt-3 text-base leading-7">{pattern}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="arc-panel p-6 sm:p-7">
              <p className="arc-chip">Next watch</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-tight">
                One pick with a reason
              </h2>
              <p className="mt-6 text-lg leading-8 text-foreground/90">{data.nextWatch}</p>
            </Card>
          </motion.div>
        </motion.div>
      </motion.section>
    </motion.div>
  )
}
