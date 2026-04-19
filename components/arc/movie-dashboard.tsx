'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock3, Film, NotebookPen, Plus, Search, Star, Ticket, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { PageIntro } from '@/components/arc/page-intro'
import { fadeUp, stagger } from '@/components/arc/motion-primitives'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateMovie,
  useDeleteMovie,
  useMovies,
  useMovieSearch,
  useUpdateMovie,
} from '@/hooks/use-arc'
import { TMDB_IMAGE_BASE_URL } from '@/lib/arc/constants'
import { cn } from '@/lib/utils'
import { movieSearchSchema } from '@/lib/validations/arc'

const movieFormSchema = z.object({
  userRating: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
    z.number().int().min(1).max(10).nullable()
  ),
  note: z.preprocess(
    (value) => (typeof value === 'string' && value.trim().length === 0 ? null : value),
    z.string().trim().max(500).nullable()
  ),
})

type MovieFormValues = z.input<typeof movieFormSchema>
type SearchFormValues = z.input<typeof movieSearchSchema>

export function MovieDashboard() {
  const [genre, setGenre] = useState('')
  const [sort, setSort] = useState<'date' | 'rating'>('date')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchSheetOpen, setSearchSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: movies = [], isLoading } = useMovies({
    ...(genre ? { genre } : {}),
    sort,
  })
  const { data: searchResults = [], isLoading: searchLoading } = useMovieSearch(searchQuery)
  const updateMovie = useUpdateMovie()
  const createMovie = useCreateMovie()
  const deleteMovie = useDeleteMovie()

  const genres = useMemo(
    () => [...new Set(movies.flatMap((movie) => movie.genres))].sort((a, b) => a.localeCompare(b)),
    [movies]
  )
  const ratedCount = movies.filter((movie) => typeof movie.userRating === 'number').length
  const avgRating = ratedCount
    ? (
        movies.reduce((total, movie) => total + (movie.userRating ?? 0), 0) / ratedCount
      ).toFixed(1)
    : 'N/A'
  const selectedMovie = movies.find((movie) => movie.id === selectedId) ?? null
  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      userRating: selectedMovie?.userRating?.toString() ?? '',
      note: selectedMovie?.note ?? '',
    },
  })
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(movieSearchSchema),
    defaultValues: {
      query: '',
    },
  })

  useEffect(() => {
    form.reset({
      userRating: selectedMovie?.userRating?.toString() ?? '',
      note: selectedMovie?.note ?? '',
    })
  }, [form, selectedMovie])

  async function onSubmit(values: MovieFormValues) {
    if (!selectedMovie) return

    const parsed = movieFormSchema.parse(values)

    await updateMovie.mutateAsync({
      id: selectedMovie.id,
      userRating: parsed.userRating,
      note: parsed.note,
    })

    toast.success('Movie updated.')
  }

  async function handleDeleteMovie() {
    if (!selectedMovie) return

    await deleteMovie.mutateAsync(selectedMovie.id)
    toast.success('Movie deleted.')
    setSelectedId(null)
  }

  function onSearchSubmit(values: SearchFormValues) {
    const parsed = movieSearchSchema.parse(values)
    setSearchQuery(parsed.query)
  }

  async function handleCreateMovie(tmdbId: number) {
    const created = await createMovie.mutateAsync(tmdbId)
    toast.success(`Logged ${created.title}.`)
    setSearchSheetOpen(false)
    setSearchQuery('')
    searchForm.reset()
    setSelectedId(created.id)
  }

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show">
      <PageIntro
        eyebrow="Arc Library"
        title="Your watch history, staged like a personal repertory."
        description="Browse the whole collection, filter by genre, and open any title into a richer editing view for notes, ratings, and comparisons with the TMDB baseline."
        aside={
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <HeroMetric label="Logged" value={String(movies.length)} icon={Film} />
              <HeroMetric label="Rated" value={String(ratedCount)} icon={Star} />
              <HeroMetric label="Avg score" value={avgRating} icon={Ticket} />
            </div>
            <Button
              type="button"
              onClick={() => setSearchSheetOpen(true)}
              className="rounded-full"
            >
              <Plus className="size-4" />
              Search and log
            </Button>
          </div>
        }
      />

      <motion.section
        variants={fadeUp}
        className="arc-panel flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Refine the shelf</p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
            Keep the grid focused when you want to revisit a mood, compare scores, or clean up your notes.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Genre</span>
            <select
              className="h-11 min-w-44 rounded-2xl border border-white/10 bg-white/8 px-4 text-sm"
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
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sort</span>
            <select
              className="h-11 min-w-44 rounded-2xl border border-white/10 bg-white/8 px-4 text-sm"
              value={sort}
              onChange={(event) => setSort(event.target.value as 'date' | 'rating')}
            >
              <option value="date">Newest first</option>
              <option value="rating">Highest rated</option>
            </select>
          </label>
        </div>
      </motion.section>

      {isLoading ? (
        <Card className="arc-panel p-8 text-muted-foreground">Loading movies...</Card>
      ) : movies.length === 0 ? (
        <Card className="arc-panel p-8 text-muted-foreground">
          Nothing logged yet. Start with <code>/log &lt;movie name&gt;</code> in Telegram and Arc will build the shelf for you.
        </Card>
      ) : (
        <motion.section variants={stagger} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {movies.map((movie) => (
            <motion.button
              key={movie.id}
              type="button"
              onClick={() => setSelectedId(movie.id)}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.99 }}
              className="text-left"
            >
              <Card className="arc-panel group h-full overflow-hidden p-0">
                <div className="relative aspect-[2/2.3] overflow-hidden">
                  {movie.posterPath ? (
                    <Image
                      src={`${TMDB_IMAGE_BASE_URL}${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
                      No poster
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute right-4 bottom-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs text-white backdrop-blur">
                    {movie.userRating ? `${movie.userRating}/10` : 'Unrated'}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      {movie.releaseYear ?? 'Unknown year'}
                    </p>
                    <h2 className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight">
                      {movie.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Clock3 className="size-4" />
                      <span>{movie.runtime ? `${movie.runtime} min` : 'Runtime unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <NotebookPen className="size-4" />
                      <span>{movie.note ? 'Has note' : 'No note yet'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.button>
          ))}
        </motion.section>
      )}

      <AnimatePresence>
        {searchSheetOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close search sheet"
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
              onClick={() => setSearchSheetOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-background/92 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <div className="grid gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Search TMDB</p>
                    <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight">
                      Find the right movie before you log it.
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                      Search the TMDB catalog, compare candidates, and add the exact title you meant instead of relying on a blind first match.
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => setSearchSheetOpen(false)}>
                    Close
                  </Button>
                </div>

                <form className="arc-panel space-y-4 p-5 sm:p-6" onSubmit={searchForm.handleSubmit(onSearchSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="movie-search">Movie title</Label>
                    <div className="flex gap-3">
                      <Input
                        id="movie-search"
                        placeholder="Dune, Past Lives, Perfect Days..."
                        className="h-11 rounded-2xl border-white/10 bg-white/8"
                        {...searchForm.register('query')}
                      />
                      <Button type="submit" className="rounded-full px-5">
                        <Search className="size-4" />
                        Search
                      </Button>
                    </div>
                    {searchForm.formState.errors.query ? (
                      <p className="text-sm text-destructive">{searchForm.formState.errors.query.message}</p>
                    ) : null}
                  </div>
                </form>

                {searchQuery ? (
                  <div className="grid gap-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Results for “{searchQuery}”
                    </p>

                    {searchLoading ? (
                      <Card className="arc-panel p-6 text-muted-foreground">Searching TMDB...</Card>
                    ) : searchResults.length === 0 ? (
                      <Card className="arc-panel p-6 text-muted-foreground">
                        No strong matches found. Try a more exact title or include the year.
                      </Card>
                    ) : (
                      searchResults.map((movie) => (
                        <Card key={movie.tmdbId} className="arc-panel overflow-hidden p-0">
                          <div className="grid gap-0 sm:grid-cols-[0.42fr_1.58fr]">
                            <div className="relative min-h-64 bg-muted">
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

                            <div className="p-5 sm:p-6">
                              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                {movie.releaseYear ?? 'Unknown year'}
                                {movie.runtime ? ` · ${movie.runtime} min` : ''}
                              </p>
                              <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight">
                                {movie.title}
                              </h3>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {movie.genres.map((item) => (
                                  <span
                                    key={item}
                                    className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>

                              <p className="mt-5 line-clamp-4 text-sm leading-7 text-muted-foreground">
                                {movie.overview || 'No overview available for this result.'}
                              </p>

                              <div className="mt-6 flex items-center justify-between gap-4">
                                <p className="text-sm text-muted-foreground">
                                  TMDB score: {movie.tmdbRating ?? 'N/A'}
                                </p>
                                <Button
                                  type="button"
                                  className="rounded-full px-5"
                                  disabled={createMovie.isPending}
                                  onClick={() => handleCreateMovie(movie.tmdbId)}
                                >
                                  <Plus className="size-4" />
                                  {createMovie.isPending ? 'Logging...' : 'Log this movie'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                ) : (
                  <Card className="arc-panel p-6 text-muted-foreground">
                    Search by title to pull live TMDB matches into Arc.
                  </Card>
                )}
              </div>
            </motion.aside>
          </>
        ) : null}

        {selectedMovie ? (
          <>
            <motion.button
              type="button"
              aria-label="Close drawer"
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-background/92 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <div className="grid gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Movie detail</p>
                    <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight">
                      {selectedMovie.title}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {selectedMovie.releaseYear ?? 'Unknown year'} · {selectedMovie.runtime ?? 'Unknown'} min
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedId(null)}>
                    Close
                  </Button>
                </div>

                <div className="arc-panel overflow-hidden p-0">
                  <div className="grid gap-0 md:grid-cols-[0.78fr_1.22fr]">
                    <div className="relative min-h-80 bg-muted">
                      {selectedMovie.posterPath ? (
                        <Image
                          src={`${TMDB_IMAGE_BASE_URL}${selectedMovie.posterPath}`}
                          alt={selectedMovie.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          No poster available
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4 p-5 sm:p-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <DetailStat label="TMDB score" value={selectedMovie.tmdbRating?.toFixed(1) ?? 'N/A'} />
                        <DetailStat label="Your score" value={selectedMovie.userRating?.toString() ?? 'Unrated'} />
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Genres</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedMovie.genres.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-sm leading-7 text-muted-foreground">
                        {selectedMovie.note
                          ? selectedMovie.note
                          : 'No note yet. Leave yourself a sharper impression while the movie is still fresh.'}
                      </div>
                    </div>
                  </div>
                </div>

                <form className="arc-panel space-y-5 p-5 sm:p-6" onSubmit={form.handleSubmit(onSubmit)}>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Edit your take</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Ratings and notes feed Arc’s stats, suggestions, and insight engine, so the more precise you are here, the better the app gets.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userRating">Your rating</Label>
                    <Input
                      id="userRating"
                      type="number"
                      min={1}
                      max={10}
                      className="h-11 rounded-2xl border-white/10 bg-white/8"
                      {...form.register('userRating')}
                    />
                    {form.formState.errors.userRating ? (
                      <p className="text-sm text-destructive">{form.formState.errors.userRating.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Your note</Label>
                    <Textarea
                      id="note"
                      rows={6}
                      className="rounded-2xl border-white/10 bg-white/8"
                      {...form.register('note')}
                    />
                    {form.formState.errors.note ? (
                      <p className="text-sm text-destructive">{form.formState.errors.note.message}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={updateMovie.isPending} className="rounded-full px-6">
                      {updateMovie.isPending ? 'Saving...' : 'Save changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="rounded-full px-6"
                      disabled={deleteMovie.isPending}
                      onClick={handleDeleteMovie}
                    >
                      <Trash2 className="size-4" />
                      {deleteMovie.isPending ? 'Deleting...' : 'Delete movie'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function HeroMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Film
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/7 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 line-clamp-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn('rounded-[1.4rem] border border-white/10 bg-white/7 p-4')}>
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}
