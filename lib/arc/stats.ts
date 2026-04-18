import type {
  DashboardStats,
  GenreStat,
  MovieHighlight,
  MovieListItem,
  TasteProfileSnapshot,
} from '@/lib/arc/types'

type MovieLike = {
  id: string
  title: string
  releaseYear: number | null
  posterPath: string | null
  genres: string[]
  watchedAt: Date | string
  userRating: number | null
  tmdbRating: number | null
}

const round = (value: number) => Math.round(value * 10) / 10

export function serializeMovie<T extends {
  id: string
  tmdbId: number
  title: string
  releaseYear: number | null
  posterPath: string | null
  genres: string[]
  runtime: number | null
  tmdbRating: number | null
  userRating: number | null
  note: string | null
  watchedAt: Date
  createdAt: Date
}>(movie: T): MovieListItem {
  return {
    ...movie,
    watchedAt: movie.watchedAt.toISOString(),
    createdAt: movie.createdAt.toISOString(),
  }
}

export function getGenreStats(movies: MovieLike[]): GenreStat[] {
  const genreMap = new Map<string, { count: number; ratings: number[] }>()

  for (const movie of movies) {
    for (const genre of movie.genres) {
      const current = genreMap.get(genre) ?? { count: 0, ratings: [] }
      current.count += 1

      if (typeof movie.userRating === 'number') {
        current.ratings.push(movie.userRating)
      }

      genreMap.set(genre, current)
    }
  }

  return [...genreMap.entries()]
    .map(([genre, value]) => ({
      genre,
      count: value.count,
      avgRating:
        value.ratings.length > 0
          ? round(
              value.ratings.reduce((total, rating) => total + rating, 0) /
                value.ratings.length
            )
          : null,
      weight: round(
        value.count +
          (value.ratings.length > 0
            ? value.ratings.reduce((total, rating) => total + rating, 0) /
              value.ratings.length /
              10
            : 0)
      ),
    }))
    .sort((a, b) => b.weight - a.weight || b.count - a.count || a.genre.localeCompare(b.genre))
}

export function getAverageRating(movies: MovieLike[]) {
  const ratings = movies
    .map((movie) => movie.userRating)
    .filter((rating): rating is number => typeof rating === 'number')

  if (ratings.length === 0) {
    return null
  }

  return round(ratings.reduce((total, rating) => total + rating, 0) / ratings.length)
}

export function getWatchStreak(movies: MovieLike[]) {
  const uniqueDays = [...new Set(movies.map((movie) => new Date(movie.watchedAt).toISOString().slice(0, 10)))]
    .sort((a, b) => (a < b ? 1 : -1))

  if (uniqueDays.length === 0) {
    return 0
  }

  let streak = 1

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previous = new Date(`${uniqueDays[index - 1]}T00:00:00.000Z`)
    const current = new Date(`${uniqueDays[index]}T00:00:00.000Z`)
    const difference = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)

    if (difference === 1) {
      streak += 1
      continue
    }

    break
  }

  return streak
}

function getHighlight(movies: MovieLike[], direction: 'best' | 'worst'): MovieHighlight | null {
  const ratedMovies = movies.filter(
    (movie): movie is MovieLike & { userRating: number } =>
      typeof movie.userRating === 'number'
  )

  if (ratedMovies.length === 0) {
    return null
  }

  const sorted = ratedMovies.sort((a, b) => {
    const tmdbDelta = (b.tmdbRating ?? 0) - (a.tmdbRating ?? 0)

    if (direction === 'best') {
      return b.userRating - a.userRating || tmdbDelta
    }

    return a.userRating - b.userRating || -tmdbDelta
  })

  const movie = sorted[0]

  return {
    id: movie.id,
    title: movie.title,
    releaseYear: movie.releaseYear,
    posterPath: movie.posterPath,
    userRating: movie.userRating,
    tmdbRating: movie.tmdbRating,
  }
}

export function buildTasteProfileSnapshot(movies: MovieLike[]): TasteProfileSnapshot {
  return {
    topGenres: getGenreStats(movies).slice(0, 5),
    avgRating: getAverageRating(movies),
    totalWatched: movies.length,
  }
}

export function buildDashboardStats(movies: MovieLike[]): DashboardStats {
  return {
    totalWatched: movies.length,
    avgRating: getAverageRating(movies),
    topGenres: getGenreStats(movies).slice(0, 3),
    bestRated: getHighlight(movies, 'best'),
    worstRated: getHighlight(movies, 'worst'),
    watchStreak: getWatchStreak(movies),
  }
}
