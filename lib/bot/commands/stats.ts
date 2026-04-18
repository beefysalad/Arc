import { ask } from '@/lib/bot/gemini'
import { sendMessage } from '@/lib/bot/telegram'
import { buildDashboardStats } from '@/lib/arc/stats'

import type { CommandHandler } from '@/lib/bot/commands/types'
import { requireLinkedTelegramUser } from '@/lib/bot/commands/utils'

export const handleStats: CommandHandler = async (chatId, args, prisma) => {
  const telegramUser = await requireLinkedTelegramUser(args.telegramId)
  const movies = await prisma.movie.findMany({
    where: { userId: telegramUser.clerkUserId },
    orderBy: { watchedAt: 'desc' },
  })

  const stats = buildDashboardStats(movies)
  const insight = await ask(`Write one sharp insight about this viewing data.
Stats: ${JSON.stringify(stats)}.
Ground the insight in the provided stats only.`)

  await sendMessage(
    chatId,
    `Arc stats\n\nTotal watched: ${stats.totalWatched}\nAverage rating: ${stats.avgRating ?? 'N/A'}\nTop genres: ${stats.topGenres.map((genre) => `${genre.genre} (${genre.count})`).join(', ') || 'N/A'}\nBest rated: ${stats.bestRated ? `${stats.bestRated.title} (${stats.bestRated.userRating}/10)` : 'N/A'}\nWorst rated: ${stats.worstRated ? `${stats.worstRated.title} (${stats.worstRated.userRating}/10)` : 'N/A'}\nWatch streak: ${stats.watchStreak} day(s)\n\n${insight}`
  )
}

