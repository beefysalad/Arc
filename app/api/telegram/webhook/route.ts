import { NextRequest, NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { telegramService } from '@/lib/services/telegram-service'

type TelegramUpdate = {
  message?: {
    chat?: {
      id?: number | string
      username?: string
      type?: string
    }
    from?: {
      id?: number | string
      username?: string
    }
    text?: string
  }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token')

  if (env.TELEGRAM_WEBHOOK_SECRET && secret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
  }

  const payload = (await request.json()) as TelegramUpdate

  if (!payload.message) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  try {
    await telegramService.handleIncomingMessage(payload.message)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to process Telegram update'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

