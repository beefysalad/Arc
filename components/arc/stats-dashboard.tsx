'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

import { TMDB_IMAGE_BASE_URL } from '@/lib/arc/constants'
import { useStats } from '@/hooks/use-arc'
import { Card } from '@/components/ui/card'
import { fadeUp, stagger } from '@/components/arc/motion-primitives'

function RatedMovieCard({
  title,
  posterPath,
  releaseYear,
  userRating,
}: {
  title: string
  posterPath: string | null
  releaseYear: number | null
  userRating: number | null
}) {
  return (
    <Card className="gap-4 border-white/10 bg-white/5 p-4">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted">
        {posterPath ? (
          <Image
            src={`${TMDB_IMAGE_BASE_URL}${posterPath}`}
            alt={title}
            fill
            className="object-cover"
          />
        ) : null}
      </div>
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{releaseYear ?? 'Unknown year'}</p>
        <p className="mt-3 text-sm">Your rating: {userRating ?? 'N/A'}</p>
      </div>
    </Card>
  )
}

export function StatsDashboard() {
  const { data, isLoading } = useStats()

  if (isLoading || !data) {
    return <div className="text-muted-foreground">Loading stats...</div>
  }

  return (
    <motion.div
      className="space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.section variants={fadeUp} className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.14),transparent_32%),rgba(255,255,255,0.03)] p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Arc stats</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">The pattern behind your picks.</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Quick reads on volume, genre gravity, streaks, and where your ratings get generous or brutal.
        </p>
      </motion.section>
      <motion.section variants={stagger} className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total watched', value: data.totalWatched },
          { label: 'Average rating', value: data.avgRating ?? 'N/A' },
          { label: 'Watch streak', value: `${data.watchStreak} days` },
          { label: 'Top genre count', value: data.topGenres[0]?.count ?? 0 },
        ].map((item) => (
          <motion.div key={item.label} variants={fadeUp} whileHover={{ y: -4 }}>
          <Card className="border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
            <p className="mt-4 text-4xl font-semibold">{item.value}</p>
          </Card>
          </motion.div>
        ))}
      </motion.section>

      <motion.section variants={stagger} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div variants={fadeUp}>
        <Card className="border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Top genres</h2>
          <div className="mt-6 space-y-4">
            {data.topGenres.map((genre) => (
              <div key={genre.genre} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{genre.genre}</span>
                  <span className="text-muted-foreground">{genre.count} logs</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-400 via-orange-300 to-sky-400"
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
              <RatedMovieCard {...data.bestRated} />
            </motion.div>
          ) : (
            <motion.div variants={fadeUp}>
            <Card className="border-white/10 bg-white/5 p-6 text-muted-foreground">
              Rate some films to see your best-rated favorite.
            </Card>
            </motion.div>
          )}
          {data.worstRated ? (
            <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
              <RatedMovieCard {...data.worstRated} />
            </motion.div>
          ) : (
            <motion.div variants={fadeUp}>
            <Card className="border-white/10 bg-white/5 p-6 text-muted-foreground">
              Arc will flag your roughest miss once you rate more movies.
            </Card>
            </motion.div>
          )}
        </motion.div>
      </motion.section>
    </motion.div>
  )
}
