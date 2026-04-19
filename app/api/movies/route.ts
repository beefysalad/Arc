import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { getMovieById } from '@/lib/bot/tmdb'
import { refreshTasteProfile } from '@/lib/arc/profile'
import { serializeMovie } from '@/lib/arc/stats'
import prisma from '@/lib/prisma'
import { createMovieSchema, movieFilterSchema } from '@/lib/validations/arc'

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filters = movieFilterSchema.parse({
    genre: searchParams.get('genre') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
  })

  const movies = await prisma.movie.findMany({
    where: {
      userId,
      ...(filters.genre ? { genres: { has: filters.genre } } : {}),
    },
    orderBy:
      filters.sort === 'rating'
        ? [{ userRating: 'desc' }, { watchedAt: 'desc' }]
        : [{ watchedAt: 'desc' }],
  })

  return NextResponse.json(movies.map(serializeMovie))
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const input = createMovieSchema.parse(body)

  const movie = await getMovieById(input.tmdbId)

  if (!movie) {
    return NextResponse.json({ error: 'Movie not found on TMDB' }, { status: 404 })
  }

  const createdMovie = await prisma.movie.create({
    data: {
      userId,
      tmdbId: movie.id,
      title: movie.title,
      releaseYear: movie.year,
      posterPath: movie.posterPath,
      genres: movie.genres.map((genre) => genre.name),
      runtime: movie.runtime,
      tmdbRating: movie.tmdbRating,
    },
  })

  await refreshTasteProfile(userId)

  return NextResponse.json(serializeMovie(createdMovie), { status: 201 })
}
