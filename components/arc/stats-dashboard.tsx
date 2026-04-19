'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Flame, Layers3, Star, Trophy, VenetianMask } from 'lucide-react'

import { PageIntro } from '@/components/arc/page-intro'
import { fadeUp, stagger } from '@/components/arc/motion-primitives'
import { Card } from '@/components/ui/card'
import { useStats } from '@/hooks/use-arc'
import { TMDB_IMAGE_BASE_URL } from '@/lib/arc/constants'

function RatedMovieCard({
  label,
  title,
  posterPath,
  releaseYear,
  userRating,
}: {
  label: string
  title: string
  posterPath: string | null
  releaseYear: number | null
  userRating: number | null
}) {
  return (
    <Card className="arc-panel overflow-hidden p-0">
      <div className="grid gap-0 sm:grid-cols-[0.7fr_1.3fr]">
        <div className="relative min-h-56 bg-muted">
          {posterPath ? (
            <Image
              src={`${TMDB_IMAGE_BASE_URL}${posterPath}`}
              alt={title}
              fill
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight">
            {title}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">{releaseYear ?? 'Unknown year'}</p>
          <p className="mt-6 text-sm text-muted-foreground">Your rating</p>
          <p className="text-3xl font-semibold">{userRating ?? 'N/A'}</p>
        </div>
      </div>
    </Card>
  )
}

export function StatsDashboard() {
  const { data, isLoading } = useStats()

  if (isLoading || !data) {
    return <div className="text-muted-foreground">Loading stats...</div>
  }

  const statCards = [
    { label: 'Total watched', value: data.totalWatched, icon: Layers3 },
    { label: 'Average rating', value: data.avgRating ?? 'N/A', icon: Star },
    { label: 'Watch streak', value: `${data.watchStreak} days`, icon: Flame },
    {
      label: 'Top genre volume',
      value: data.topGenres[0] ? `${data.topGenres[0].count} logs` : '0 logs',
      icon: Trophy,
    },
  ]

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show">
      <PageIntro
        eyebrow="Arc Stats"
        title="The pattern behind what keeps pulling you back."
        description="A cleaner read on volume, streaks, genre gravity, and where your ratings get generous or merciless."
        aside={
          <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Current lead</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight">
              {data.topGenres[0]?.genre ?? 'Still forming'}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {data.topGenres[0]
                ? `${data.topGenres[0].count} watches are already orbiting this lane.`
                : 'Once you rate and log more films, Arc will show the genre that defines your center of gravity.'}
            </p>
          </div>
        }
      />

      <motion.section variants={stagger} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <motion.article key={item.label} variants={fadeUp} whileHover={{ y: -6 }}>
            <Card className="arc-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {item.label}
                </p>
                <item.icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight">
                {item.value}
              </p>
            </Card>
          </motion.article>
        ))}
      </motion.section>

      <motion.section variants={stagger} className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <motion.div variants={fadeUp}>
          <Card className="arc-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/20 to-sky-400/20">
                <VenetianMask className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Top genres</p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                  The moods you default to
                </h2>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {data.topGenres.map((genre) => (
                <div key={genre.genre} className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span>{genre.genre}</span>
                    <span className="text-muted-foreground">{genre.count} logs</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 via-rose-300 to-sky-400"
                      style={{ width: `${Math.min(100, genre.weight * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={stagger} className="grid gap-6">
          {data.bestRated ? (
            <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
              <RatedMovieCard label="Best rated" {...data.bestRated} />
            </motion.div>
          ) : (
            <motion.div variants={fadeUp}>
              <Card className="arc-panel p-6 text-muted-foreground">
                Rate some films to see the title that currently sits at the top of your pile.
              </Card>
            </motion.div>
          )}

          {data.worstRated ? (
            <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
              <RatedMovieCard label="Worst rated" {...data.worstRated} />
            </motion.div>
          ) : (
            <motion.div variants={fadeUp}>
              <Card className="arc-panel p-6 text-muted-foreground">
                Arc will flag the roughest miss once your rating history has more shape.
              </Card>
            </motion.div>
          )}
        </motion.div>
      </motion.section>
    </motion.div>
  )
}
