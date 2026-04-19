import prisma from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram/api'

import type { CommandHandler } from '@/lib/bot/commands/types'
import { handleInsight } from '@/lib/bot/commands/insight'
import { handleLog } from '@/lib/bot/commands/log'
import { handleMood } from '@/lib/bot/commands/mood'
import { handleRate } from '@/lib/bot/commands/rate'
import { handleSearch } from '@/lib/bot/commands/search'
import { handleStart } from '@/lib/bot/commands/start'
import { handleStats } from '@/lib/bot/commands/stats'
import { handleSuggest } from '@/lib/bot/commands/suggest'
import { handleUndo } from '@/lib/bot/commands/undo'

type TelegramMessage = {
  chat?: {
    id?: number | string
    type?: string
  }
  from?: {
    id?: number | string
    username?: string
  }
  text?: string
}

const commandHandlers: Record<string, CommandHandler> = {
  '/start': handleStart,
  '/search': handleSearch,
  '/log': handleLog,
  '/rate': handleRate,
  '/undo': handleUndo,
  '/suggest': handleSuggest,
  '/mood': handleMood,
  '/stats': handleStats,
  '/insight': handleInsight,
}

function getCommand(text?: string) {
  if (!text) {
    return null
  }

  const [command] = text.trim().split(/\s+/, 1)
  return command?.toLowerCase() ?? null
}

export const telegramService = {
  async handleIncomingMessage(message: TelegramMessage) {
    const text = message.text?.trim()
    const chatId = message.chat?.id
    const from = message.from

    if (!text || !chatId || !from?.id) {
      return
    }

    const command = getCommand(text)
    const handler = command ? commandHandlers[command] : null

    if (!handler) {
      await sendTelegramMessage({
        chatId,
        text: 'Arc knows /start, /search, /log, /rate, /undo, /suggest, /mood, /stats, and /insight.',
      })
      return
    }

    const [, ...parts] = text.split(/\s+/)

    try {
      await handler(
        String(chatId),
        {
          raw: text,
          parts,
          telegramId: String(from.id),
          telegramUsername: from.username,
        },
        prisma
      )
    } catch (error) {
      await sendTelegramMessage({
        chatId,
        text:
          error instanceof Error ? error.message : 'Arc hit an unexpected error.',
      })
    }
  },
}
