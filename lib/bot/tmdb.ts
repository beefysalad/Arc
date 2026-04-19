import { env } from '@/lib/env'

export type TmdbMovie = {
  id: number
  title: string
  year: number | null
  overview: string
  posterPath: string | null
  genres: Array<{ id: number; name: string }>
  runtime: number | null
  tmdbRating: number | null
}

type DiscoverOptions = {
  genreIds: number[]
  excludeIds?: number[]
  runtimeGte?: number
  runtimeLte?: number
}

let genreCache: Array<{ id: number; name: string }> | null = null

async function tmdbFetch<T>(path: string, searchParams?: URLSearchParams) {
  const params = searchParams ?? new URLSearchParams()
  params.set('api_key', env.TMDB_API_KEY)
  const response = await fetch(`https://api.themoviedb.org/3${path}?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 * 60 },
  })

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export async function getMovieGenres() {
  if (genreCache) {
    return genreCache
  }

  const response = await tmdbFetch<{ genres: Array<{ id: number; name: string }> }>(
    '/genre/movie/list',
    new URLSearchParams({ language: 'en-US' })
  )

  genreCache = response.genres
  return genreCache
}

export async function getGenreIdsByNames(names: string[]) {
  const genres = await getMovieGenres()
  const byName = new Map(genres.map((genre) => [genre.name.toLowerCase(), genre.id]))

  return names
    .map((name) => byName.get(name.toLowerCase()))
    .filter((value): value is number => typeof value === 'number')
}

async function getMovieDetails(movieId: number) {
  return tmdbFetch<{
    id: number
    title: string
    release_date?: string
    overview?: string
    poster_path?: string | null
    genres: Array<{ id: number; name: string }>
    runtime?: number | null
    vote_average?: number | null
  }>(`/movie/${movieId}`, new URLSearchParams({ language: 'en-US' }))
}

function normalizeMovie(movie: Awaited<ReturnType<typeof getMovieDetails>>): TmdbMovie {
  return {
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? Number.parseInt(movie.release_date.slice(0, 4), 10) : null,
    overview: movie.overview ?? '',
    posterPath: movie.poster_path ?? null,
    genres: movie.genres,
    runtime: movie.runtime ?? null,
    tmdbRating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
  }
}

export async function getMovieById(movieId: number): Promise<TmdbMovie | null> {
  try {
    const movie = await getMovieDetails(movieId)
    return normalizeMovie(movie)
  } catch {
    return null
  }
}

export async function searchMovies(query: string, limit = 5): Promise<TmdbMovie[]> {
  const searchResponse = await tmdbFetch<{
    results: Array<{ id: number }>
  }>(
    '/search/movie',
    new URLSearchParams({
      query,
      include_adult: 'false',
      language: 'en-US',
      page: '1',
    })
  )

  const results = searchResponse.results.slice(0, limit)

  if (results.length === 0) {
    return []
  }

  const movies = await Promise.all(results.map((result) => getMovieById(result.id)))
  return movies.filter((movie): movie is TmdbMovie => movie !== null)
}

export async function searchMovie(query: string): Promise<TmdbMovie | null> {
  const [firstResult] = await searchMovies(query, 1)
  return firstResult ?? null
}

export async function discoverMovies(options: DiscoverOptions): Promise<TmdbMovie[]> {
  const results: TmdbMovie[] = []
  const excludeSet = new Set(options.excludeIds ?? [])
  const genres = await getMovieGenres()
  const genreMap = new Map(genres.map((genre) => [genre.id, genre.name]))

  for (const page of ['1', '2']) {
    const response = await tmdbFetch<{
      results: Array<{
        id: number
        title: string
        release_date?: string
        overview?: string
        poster_path?: string | null
        genre_ids: number[]
        vote_average?: number | null
      }>
    }>(
      '/discover/movie',
      new URLSearchParams({
        include_adult: 'false',
        include_video: 'false',
        language: 'en-US',
        page,
        sort_by: 'vote_average.desc',
        'vote_count.gte': '150',
        with_genres: options.genreIds.join(','),
        ...(options.runtimeGte ? { 'with_runtime.gte': String(options.runtimeGte) } : {}),
        ...(options.runtimeLte ? { 'with_runtime.lte': String(options.runtimeLte) } : {}),
      })
    )

    for (const movie of response.results) {
      if (excludeSet.has(movie.id)) {
        continue
      }

      results.push({
        id: movie.id,
        title: movie.title,
        year: movie.release_date
          ? Number.parseInt(movie.release_date.slice(0, 4), 10)
          : null,
        overview: movie.overview ?? '',
        posterPath: movie.poster_path ?? null,
        genres: movie.genre_ids.map((genreId) => ({
          id: genreId,
          name: genreMap.get(genreId) ?? 'Unknown',
        })),
        runtime: null,
        tmdbRating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
      })
    }

    if (results.length >= 10) {
      break
    }
  }

  return results.slice(0, 10)
}
