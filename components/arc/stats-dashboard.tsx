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
          <p className="arc-chip">{label}</p>
          <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight">
            {title}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">{releaseYear ?? 'Unknown year'}</p>
          <div className="arc-divider mt-6" />
          <p className="mt-4 text-sm text-muted-foreground">Your rating</p>
          <p className="text-4xl font-semibold">{userRating ?? 'N/A'}</p>
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
        title="A control room for the patterns hiding inside your log."
        description="This page should feel more like a season report than a dashboard dump. Volume, streaks, dominant moods, and your best and worst calls all live in one place."
        aside={
          <div className="arc-panel p-5">
            <p className="arc-chip">Current lead</p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight">
              {data.topGenres[0]?.genre ?? 'Still forming'}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {data.topGenres[0]
                ? `${data.topGenres[0].count} watches are already bending your library in this direction.`
                : 'A few more logs will give Arc enough shape to call your dominant lane.'}
            </p>
          </div>
        }
      />

      <motion.section variants={stagger} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <motion.article key={item.label} variants={fadeUp} whileHover={{ y: -4 }}>
            <Card className="arc-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  {item.label}
                </p>
                <item.icon className="size-4 text-primary" />
              </div>
              <p className="mt-5 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight">
                {item.value}
              </p>
            </Card>
          </motion.article>
        ))}
      </motion.section>

      <motion.section variants={stagger} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div variants={fadeUp} className="grid gap-6">
          <Card className="arc-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                <VenetianMask className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Genre ladder</p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                  What keeps resurfacing
                </h2>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {data.topGenres.map((genre, index) => (
                <div
                  key={genre.genre}
                  className="grid gap-3 rounded-[1.4rem] border border-white/10 bg-black/25 p-4 md:grid-cols-[auto_1fr_auto]"
                >
                  <div className="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-lg font-medium">{genre.genre}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {genre.count} logs{genre.avgRating ? ` · avg ${genre.avgRating}/10` : ''}
                    </p>
                  </div>
                  <div className="flex items-center md:justify-end">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, genre.weight * 10)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="arc-panel p-6">
            <p className="arc-chip">Reading</p>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-foreground/90">
              {data.topGenres[0]
                ? `Your library is not random. ${data.topGenres[0].genre} is currently steering the whole thing, while your ${data.watchStreak}-day streak suggests this is becoming a habit rather than a phase.`
                : 'Arc needs a few more logs before the bigger patterns start to harden into something readable.'}
            </p>
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
