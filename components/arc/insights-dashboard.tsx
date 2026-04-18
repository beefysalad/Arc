'use client'

import { differenceInHours } from 'date-fns'
import { motion } from 'framer-motion'
import { useState } from 'react'

import { INSIGHT_CACHE_HOURS } from '@/lib/arc/constants'
import { useInsights } from '@/hooks/use-arc'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fadeUp, stagger } from '@/components/arc/motion-primitives'

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

  async function handleRefresh() {
    setForce(true)
  }

  return (
    <motion.div
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Arc insights</p>
          <h1 className="mt-2 text-4xl font-semibold">Your taste in a nutshell</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            These reads stay grounded in your actual watch history, so they feel more like a sharp friend than a horoscope.
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={!canRefresh || isFetching}>
          {canRefresh ? (isFetching ? 'Refreshing...' : 'Regenerate') : `Refreshes in ${hoursRemaining}h`}
        </Button>
      </motion.div>

      <motion.div variants={fadeUp}>
      <Card className="border-white/10 bg-white/5 p-6">
        <p className="text-lg leading-8 text-foreground/90">{data.summary}</p>
      </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
      <Card className="border-white/10 bg-gradient-to-br from-sky-500/12 via-background to-pink-500/12 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Blind spot</p>
        <p className="mt-3 text-xl font-semibold">{data.blindSpot}</p>
      </Card>
      </motion.div>

      <motion.section variants={stagger} className="grid gap-4 md:grid-cols-3">
        {data.patterns.map((pattern) => (
          <motion.div key={pattern} variants={fadeUp} whileHover={{ y: -4 }}>
          <Card className="border-white/10 bg-white/5 p-6">
            <p className="text-base leading-7">{pattern}</p>
          </Card>
          </motion.div>
        ))}
      </motion.section>

      <motion.div variants={fadeUp}>
      <Card className="border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Next watch</p>
        <p className="mt-3 text-xl font-semibold">{data.nextWatch}</p>
      </Card>
      </motion.div>
    </motion.div>
  )
}
