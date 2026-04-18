import { z } from 'zod'

import { ask } from '@/lib/bot/gemini'
import { discoverMovies, getGenreIdsByNames } from '@/lib/bot/tmdb'
import { sendMessage } from '@/lib/bot/telegram'

import type { CommandHandler } from '@/lib/bot/commands/types'
import { requireLinkedTelegramUser } from '@/lib/bot/commands/utils'

const moodSchema = z.object({
  genres: z.array(z.string()).min(1).max(3),
  runtimeMin: z.number().int().min(60).max(240).nullable(),
  runtimeMax: z.number().int().min(60).max(240).nullable(),
  rationale: z.string().min(1),
})

export const handleMood: CommandHandler = async (chatId, args, prisma) => {
  const mood = args.parts.join(' ').trim()

  if (!mood) {
    await sendMessage(chatId, 'Usage: /mood <how you want the movie to feel>')
    return
  }

  const telegramUser = await requireLinkedTelegramUser(args.telegramId)
  const movies = await prisma.movie.findMany({
    where: { userId: telegramUser.clerkUserId },
    orderBy: { watchedAt: 'desc' },
    take: 5,
  })

  const response = await ask(`Return JSON with keys genres, runtimeMin, runtimeMax, rationale.
User mood: ${mood}.
User top genres: ${JSON.stringify(
    [...new Set(movies.flatMap((movie) => movie.genres))].slice(0, 5)
  )}.
Recent watches:
${movies.map((movie) => `- ${movie.title} [${movie.genres.join(', ')}]`).join('\n') || 'None'}

Infer the best genre and runtime filters only from the mood and watch history.`)

  const parsed = moodSchema.parse(JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] ?? response))
  const genreIds = await getGenreIdsByNames(parsed.genres)
  const candidates = await discoverMovies({
    genreIds,
    excludeIds: movies.map((movie) => movie.tmdbId),
    runtimeGte: parsed.runtimeMin ?? undefined,
    runtimeLte: parsed.runtimeMax ?? undefined,
  })

  const choice = candidates[0]

  if (!choice) {
    await sendMessage(chatId, 'Arc could not find a match for that mood with your current filters.')
    return
  }

  await sendMessage(
    chatId,
    `${choice.title}${choice.year ? ` (${choice.year})` : ''} — ${choice.genres.map((genre) => genre.name).join(', ')}${choice.tmdbRating ? ` — TMDB ${choice.tmdbRating}` : ''}\n\n${parsed.rationale}`
  )
}

