import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { serializeMovie } from '@/lib/arc/stats'
import prisma from '@/lib/prisma'
import { movieFilterSchema } from '@/lib/validations/arc'

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
