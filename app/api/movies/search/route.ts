import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { searchMovies } from '@/lib/bot/tmdb'
import { movieSearchSchema } from '@/lib/validations/arc'

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filters = movieSearchSchema.parse({
    query: searchParams.get('query') ?? '',
  })

  const results = await searchMovies(filters.query, 6)

  return NextResponse.json(
    results.map((movie) => ({
      tmdbId: movie.id,
      title: movie.title,
      releaseYear: movie.year,
      posterPath: movie.posterPath,
      genres: movie.genres.map((genre) => genre.name),
      runtime: movie.runtime,
      tmdbRating: movie.tmdbRating,
      overview: movie.overview,
    }))
  )
}
