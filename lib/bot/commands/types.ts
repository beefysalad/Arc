import type { PrismaClient } from '@/app/generated/prisma/client'

export type CommandArgs = {
  raw: string
  parts: string[]
  telegramId: string
  telegramUsername?: string | null
}

export type CommandHandler = (
  chatId: string,
  args: CommandArgs,
  prisma: PrismaClient
) => Promise<void>

