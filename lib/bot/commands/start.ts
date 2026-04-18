import { sendMessage } from '@/lib/bot/telegram'

import type { CommandHandler } from '@/lib/bot/commands/types'

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export const handleStart: CommandHandler = async (chatId, args, prisma) => {
  const code = generateCode()

  await prisma.pendingLink.create({
    data: {
      code,
      telegramId: args.telegramId,
      telegramUsername: args.telegramUsername ?? null,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  })

  await sendMessage(
    chatId,
    `Welcome to Arc. Your link code is: ${code} — enter this in your Arc dashboard under Settings to connect your account.`
  )
}
