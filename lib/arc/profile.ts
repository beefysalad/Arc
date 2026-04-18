import prisma from '@/lib/prisma'
import { buildTasteProfileSnapshot } from '@/lib/arc/stats'

export async function refreshTasteProfile(clerkUserId: string) {
  const movies = await prisma.movie.findMany({
    where: { userId: clerkUserId },
    orderBy: { watchedAt: 'desc' },
    select: {
      id: true,
      title: true,
      releaseYear: true,
      posterPath: true,
      genres: true,
      watchedAt: true,
      userRating: true,
      tmdbRating: true,
    },
  })

  const snapshot = buildTasteProfileSnapshot(movies)

  const profile = await prisma.tasteProfile.upsert({
    where: { clerkUserId },
    update: {
      topGenres: snapshot.topGenres,
      avgRating: snapshot.avgRating,
      totalWatched: snapshot.totalWatched,
    },
    create: {
      clerkUserId,
      topGenres: snapshot.topGenres,
      avgRating: snapshot.avgRating,
      totalWatched: snapshot.totalWatched,
    },
  })

  return {
    profile,
    snapshot,
    movies,
  }
}

