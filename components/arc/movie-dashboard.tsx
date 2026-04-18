'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Star } from 'lucide-react'
import { toast } from 'sonner'

import { TMDB_IMAGE_BASE_URL } from '@/lib/arc/constants'
import { useMovies, useUpdateMovie } from '@/hooks/use-arc'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { fadeUp, stagger } from '@/components/arc/motion-primitives'

const movieFormSchema = z.object({
  userRating: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
    z.number().int().min(1).max(10).nullable()
  ),
  note: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim().length === 0 ? null : value,
    z.string().trim().max(500).nullable()
  ),
})

type MovieFormValues = z.input<typeof movieFormSchema>

export function MovieDashboard() {
  const [genre, setGenre] = useState<string>('')
  const [sort, setSort] = useState<'date' | 'rating'>('date')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: movies = [], isLoading } = useMovies({
    ...(genre ? { genre } : {}),
    sort,
  })
  const updateMovie = useUpdateMovie()

  const genres = useMemo(
    () =>
      [...new Set(movies.flatMap((movie) => movie.genres))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [movies]
  )
  const ratedCount = movies.filter((movie) => typeof movie.userRating === 'number').length
  const latestMovie = movies[0]

  const selectedMovie = movies.find((movie) => movie.id === selectedId) ?? null
  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      userRating: selectedMovie?.userRating?.toString() ?? '',
      note: selectedMovie?.note ?? '',
    },
  })

  useEffect(() => {
    form.reset({
      userRating: selectedMovie?.userRating?.toString() ?? '',
      note: selectedMovie?.note ?? '',
    })
  }, [form, selectedMovie])

  async function onSubmit(values: MovieFormValues) {
    if (!selectedMovie) {
      return
    }

    const parsed = movieFormSchema.parse(values)

    await updateMovie.mutateAsync({
      id: selectedMovie.id,
      userRating: parsed.userRating,
      note: parsed.note,
    })

    toast.success('Movie updated.')
  }

  return (
    <motion.div
      className="space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.section variants={fadeUp} className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_32%),rgba(9,9,11,0.55)] p-6 shadow-2xl shadow-black/20">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Arc Library</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Your watch history, shaped into taste.</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Filter the grid, jump into details, and keep your ratings and notes tight enough for Arc to learn from them.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-muted-foreground">Genre</span>
              <select
                className="border-input h-10 rounded-md border bg-background/60 px-3 text-sm"
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
              >
                <option value="">All genres</option>
                {genres.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm text-muted-foreground">Sort</span>
              <select
                className="border-input h-10 rounded-md border bg-background/60 px-3 text-sm"
                value={sort}
                onChange={(event) => setSort(event.target.value as 'date' | 'rating')}
              >
                <option value="date">Newest first</option>
                <option value="rating">Highest rated</option>
              </select>
            </label>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <MetricCard label="Logged films" value={String(movies.length)} />
          <MetricCard label="Rated" value={String(ratedCount)} />
          <MetricCard label="Latest watch" value={latestMovie?.title ?? 'Nothing yet'} />
        </div>
      </motion.section>

      {isLoading ? (
        <div className="text-muted-foreground">Loading movies...</div>
      ) : movies.length === 0 ? (
        <Card className="border-white/10 bg-white/5 p-8 text-muted-foreground">
          Nothing logged yet. Start with <code>/log &lt;movie name&gt;</code> in Telegram and Arc will fill this library in.
        </Card>
      ) : (
        <motion.section
          variants={stagger}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {movies.map((movie) => (
            <motion.button
              key={movie.id}
              type="button"
              onClick={() => setSelectedId(movie.id)}
              className="text-left"
              variants={fadeUp}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card className="h-full gap-4 overflow-hidden border-white/10 bg-white/5 p-0 transition-transform duration-200 hover:-translate-y-1">
                <div className="relative aspect-[2/3] w-full bg-muted">
                  {movie.posterPath ? (
                    <Image
                      src={`${TMDB_IMAGE_BASE_URL}${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No poster
                    </div>
                  )}
                </div>
                <div className="space-y-3 px-4 pb-4">
                  <div>
                    <h2 className="line-clamp-2 text-lg font-semibold">{movie.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {movie.releaseYear ?? 'Unknown year'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="size-4 fill-current text-amber-400" />
                    <span>{movie.userRating ?? 'Unrated'}</span>
                  </div>
                </div>
              </Card>
            </motion.button>
          ))}
        </motion.section>
      )}

      <AnimatePresence>
        {selectedMovie ? (
          <>
            <motion.button
              type="button"
              aria-label="Close drawer"
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={cn(
                'fixed inset-y-0 right-0 z-40 w-full max-w-xl border-l border-white/10 bg-background/95 p-6 shadow-2xl shadow-black/40'
              )}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <div className="flex h-full flex-col gap-6 overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Movie detail</p>
                <h2 className="mt-2 text-3xl font-semibold">{selectedMovie.title}</h2>
                <p className="mt-2 text-muted-foreground">
                  {selectedMovie.releaseYear ?? 'Unknown year'} • {selectedMovie.runtime ?? 'Unknown'} min
                </p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedId(null)}>
                Close
              </Button>
            </div>

            <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">TMDB rating</p>
                <p className="mt-1 text-xl font-semibold">{selectedMovie.tmdbRating ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your rating</p>
                <p className="mt-1 text-xl font-semibold">{selectedMovie.userRating ?? 'Unrated'}</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="userRating">Your rating</Label>
                <Input id="userRating" type="number" min={1} max={10} {...form.register('userRating')} />
                {form.formState.errors.userRating ? (
                  <p className="text-sm text-destructive">{form.formState.errors.userRating.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Your note</Label>
                <Textarea id="note" {...form.register('note')} />
                {form.formState.errors.note ? (
                  <p className="text-sm text-destructive">{form.formState.errors.note.message}</p>
                ) : null}
              </div>
              <Button type="submit" disabled={updateMovie.isPending}>
                {updateMovie.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </form>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/10 bg-white/6 p-4"
    >
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-3 line-clamp-1 text-2xl font-semibold">{value}</p>
    </motion.article>
  )
}
