import { searchMovies } from '@/lib/bot/tmdb'
import { sendMessage } from '@/lib/bot/telegram'

import type { CommandHandler } from '@/lib/bot/commands/types'
import { requireLinkedTelegramUser } from '@/lib/bot/commands/utils'

export const handleSearch: CommandHandler = async (chatId, args) => {
  const query = args.parts.join(' ').trim()

  if (!query) {
    await sendMessage(chatId, 'Usage: /search <movie name>')
    return
  }

  await requireLinkedTelegramUser(args.telegramId)

  const results = await searchMovies(query, 5)

  if (results.length === 0) {
    await sendMessage(chatId, `Arc couldn't find any TMDB matches for "${query}".`)
    return
  }

  const lines = results.map((movie, index) => {
    const year = movie.year ?? 'Unknown year'
    const runtime = movie.runtime ? ` • ${movie.runtime}min` : ''
    return `${index + 1}. ${movie.title} (${year})\n/log tmdb:${movie.id}${runtime}`
  })

  await sendMessage(
    chatId,
    `Search results for *${query}*\n\n${lines.join('\n\n')}\n\nUse one of the /log tmdb:<id> commands above to save the correct movie.`
  )
}
