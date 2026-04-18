import { ask } from '@/lib/bot/gemini'
import { sendMessage } from '@/lib/bot/telegram'
import { refreshTasteProfile } from '@/lib/arc/profile'

import type { CommandHandler } from '@/lib/bot/commands/types'
import { requireLinkedTelegramUser } from '@/lib/bot/commands/utils'

export const handleRate: CommandHandler = async (chatId, args, prisma) => {
  const score = Number.parseInt(args.parts[0] ?? '', 10)

  if (!Number.isInteger(score) || score < 1 || score > 10) {
    await sendMessage(chatId, 'Usage: /rate <score between 1 and 10>')
    return
  }

  const telegramUser = await requireLinkedTelegramUser(args.telegramId)
  const latestMovie = await prisma.movie.findFirst({
    where: { userId: telegramUser.clerkUserId },
    orderBy: { createdAt: 'desc' },
  })

  if (!latestMovie) {
    await sendMessage(chatId, 'Log a movie first with /log before adding a rating.')
    return
  }

  await prisma.movie.update({
    where: { id: latestMovie.id },
    data: { userRating: score },
  })

  const { snapshot, movies } = await refreshTasteProfile(telegramUser.clerkUserId)
  const ratedMovies = movies
    .filter((movie) => typeof movie.userRating === 'number')
    .map(
      (movie) =>
        `${movie.title}${movie.releaseYear ? ` (${movie.releaseYear})` : ''}: ${movie.userRating}/10 [${movie.genres.join(', ')}]`
    )
    .join('\n')

  const insight = await ask(`Write one short insight.
Updated movie: ${latestMovie.title}, rating ${score}/10.
Taste profile: ${JSON.stringify(snapshot)}.
Full rating history:
${ratedMovies || 'No prior ratings.'}
Ground the insight in the actual ratings history only.`)

  await sendMessage(
    chatId,
    `Rated ${latestMovie.title} ${score}/10.\n\n${insight}`
  )
}

