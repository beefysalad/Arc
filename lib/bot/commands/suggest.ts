import { ask } from '@/lib/bot/gemini'
import { discoverMovies, getGenreIdsByNames } from '@/lib/bot/tmdb'
import { sendMessage } from '@/lib/bot/telegram'

import type { CommandHandler } from '@/lib/bot/commands/types'
import { requireLinkedTelegramUser } from '@/lib/bot/commands/utils'

export const handleSuggest: CommandHandler = async (chatId, args, prisma) => {
  const telegramUser = await requireLinkedTelegramUser(args.telegramId)
  const movies = await prisma.movie.findMany({
    where: { userId: telegramUser.clerkUserId },
    orderBy: { watchedAt: 'desc' },
  })

  if (movies.length === 0) {
    await sendMessage(chatId, 'Log a few movies first and Arc will start tailoring suggestions.')
    return
  }

  const ratedMovies = movies.filter((movie) => typeof movie.userRating === 'number')
  const genreWeights = new Map<string, number>()

  for (const movie of ratedMovies) {
    for (const genre of movie.genres) {
      genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + (movie.userRating ?? 0))
    }
  }

  const topGenres =
    ratedMovies.length > 0
      ? [...genreWeights.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([genre]) => genre)
      : [...new Set(movies.flatMap((movie) => movie.genres))].slice(0, 2)

  const genreIds = await getGenreIdsByNames(topGenres)

  if (genreIds.length === 0) {
    await sendMessage(chatId, 'Arc needs a little more genre signal before it can suggest something clean.')
    return
  }
  const candidates = await discoverMovies({
    genreIds,
    excludeIds: movies.map((movie) => movie.tmdbId),
  })

  if (candidates.length === 0) {
    await sendMessage(chatId, 'Arc ran out of clean candidates for that taste profile. Try logging a few more ratings.')
    return
  }

  const response = await ask(`Pick the best candidate from the list and explain why in one sentence.
User's strongest genres: ${topGenres.join(', ')}.
Watched TMDB ids: ${movies.map((movie) => movie.tmdbId).join(', ')}.
Candidates:
${candidates
  .slice(0, 5)
  .map(
    (movie) =>
      `- ${movie.title}${movie.year ? ` (${movie.year})` : ''}; genres=${movie.genres.map((genre) => genre.name).join(', ')}; tmdb=${movie.tmdbRating ?? 'Unknown'}`
  )
  .join('\n')}

Rules:
- Choose only from the candidate list.
- Mention the chosen title exactly once.
- Keep it to one sentence.`)

  await sendMessage(chatId, response)
}
