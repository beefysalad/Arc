import { ask } from '@/lib/bot/gemini'
import { sendMessage } from '@/lib/bot/telegram'

import type { CommandHandler } from '@/lib/bot/commands/types'
import { requireLinkedTelegramUser } from '@/lib/bot/commands/utils'

export const handleInsight: CommandHandler = async (chatId, args, prisma) => {
  const telegramUser = await requireLinkedTelegramUser(args.telegramId)
  const movies = await prisma.movie.findMany({
    where: { userId: telegramUser.clerkUserId },
    orderBy: { watchedAt: 'desc' },
  })

  if (movies.length === 0) {
    await sendMessage(chatId, 'Log a few movies first and Arc will turn them into taste insights.')
    return
  }

  const response = await ask(`Write exactly 3 bullet points.
Use the user's full watch history to describe:
1. their taste
2. a viewing pattern
3. a blind spot genre they have not tried much but might like

Watch history:
${movies
  .map(
    (movie) =>
      `- ${movie.title}${movie.releaseYear ? ` (${movie.releaseYear})` : ''}; genres=${movie.genres.join(', ')}; user=${movie.userRating ?? 'Unrated'}; tmdb=${movie.tmdbRating ?? 'Unknown'}`
  )
  .join('\n')}`)

  await sendMessage(chatId, response)
}
