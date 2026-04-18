import prisma from '@/lib/prisma'
import { buildDashboardStats, buildTasteProfileSnapshot } from '@/lib/arc/stats'

export async function requireLinkedTelegramUser(telegramId: string) {
  const telegramUser = await prisma.telegramUser.findUnique({
    where: { telegramId },
  })

  if (!telegramUser) {
    throw new Error('Your Telegram account is not linked yet. Use /start, then enter the code in Arc Settings.')
  }

  return telegramUser
}

export async function getUserMovieContext(clerkUserId: string) {
  const movies = await prisma.movie.findMany({
    where: { userId: clerkUserId },
    orderBy: { watchedAt: 'desc' },
  })

  return {
    movies,
    stats: buildDashboardStats(movies),
    profile: buildTasteProfileSnapshot(movies),
  }
}

