import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { refreshTasteProfile } from '@/lib/arc/profile'
import { serializeMovie } from '@/lib/arc/stats'
import prisma from '@/lib/prisma'
import { updateMovieSchema } from '@/lib/validations/arc'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await request.json()
  const input = updateMovieSchema.parse(body)

  const movie = await prisma.movie.findFirst({
    where: { id, userId },
  })

  if (!movie) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
  }

  const updated = await prisma.movie.update({
    where: { id },
    data: {
      ...(input.userRating !== undefined ? { userRating: input.userRating } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    },
  })

  await refreshTasteProfile(userId)

  return NextResponse.json(serializeMovie(updated))
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const movie = await prisma.movie.findFirst({
    where: { id, userId },
  })

  if (!movie) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
  }

  await prisma.movie.delete({
    where: { id },
  })

  await refreshTasteProfile(userId)

  return NextResponse.json({ success: true })
}
