import { ask } from '@/lib/bot/gemini'
import { searchMovie } from '@/lib/bot/tmdb'
import { sendMessage } from '@/lib/bot/telegram'
import { refreshTasteProfile } from '@/lib/arc/profile'

import type { CommandHandler } from '@/lib/bot/commands/types'
import { requireLinkedTelegramUser } from '@/lib/bot/commands/utils'

export const handleLog: CommandHandler = async (chatId, args, prisma) => {
  const query = args.parts.join(' ').trim()

  if (!query) {
    await sendMessage(chatId, 'Usage: /log <movie name>')
    return
  }

  const telegramUser = await requireLinkedTelegramUser(args.telegramId)
  const movie = await searchMovie(query)

  if (!movie) {
    await sendMessage(chatId, `Arc couldn't find a strong TMDB match for "${query}".`)
    return
  }

  await prisma.movie.create({
    data: {
      userId: telegramUser.clerkUserId,
      tmdbId: movie.id,
      title: movie.title,
      releaseYear: movie.year,
      posterPath: movie.posterPath,
      genres: movie.genres.map((genre) => genre.name),
      runtime: movie.runtime,
      tmdbRating: movie.tmdbRating,
    },
  })

  const { snapshot } = await refreshTasteProfile(telegramUser.clerkUserId)
  const reaction = await ask(`Write one sentence.
User taste profile: ${JSON.stringify(snapshot)}.
Newly logged movie: ${movie.title} (${movie.year ?? 'Unknown year'}) with genres ${movie.genres.map((genre) => genre.name).join(', ')}.
Ground the reaction in the genres and known taste profile only.`)

  await sendMessage(
    chatId,
    `Logged: ${movie.title}${movie.year ? ` (${movie.year})` : ''} — ${movie.genres.map((genre) => genre.name).join(', ')} — ${movie.runtime ?? 'Unknown'}min\n\n_${reaction}_`
  )
}

