import { sendMessage } from '@/lib/bot/telegram'
import { refreshTasteProfile } from '@/lib/arc/profile'

import type { CommandHandler } from '@/lib/bot/commands/types'
import { requireLinkedTelegramUser } from '@/lib/bot/commands/utils'

export const handleUndo: CommandHandler = async (chatId, args, prisma) => {
  const telegramUser = await requireLinkedTelegramUser(args.telegramId)

  const latestMovie = await prisma.movie.findFirst({
    where: { userId: telegramUser.clerkUserId },
    orderBy: [{ watchedAt: 'desc' }, { createdAt: 'desc' }],
  })

  if (!latestMovie) {
    await sendMessage(chatId, 'There is nothing to undo yet.')
    return
  }

  await prisma.movie.delete({
    where: { id: latestMovie.id },
  })

  await refreshTasteProfile(telegramUser.clerkUserId)

  await sendMessage(
    chatId,
    `Removed: ${latestMovie.title}${latestMovie.releaseYear ? ` (${latestMovie.releaseYear})` : ''}.`
  )
}
