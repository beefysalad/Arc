import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { setTelegramWebhook } from '@/lib/telegram/api'
import { getTelegramWebhookUrl } from '@/lib/telegram/linking'

export async function POST() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const webhookUrl = getTelegramWebhookUrl()
    await setTelegramWebhook(webhookUrl, process.env.TELEGRAM_WEBHOOK_SECRET)

    return NextResponse.json({
      success: true,
      webhookUrl,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to register Telegram webhook',
      },
      { status: 500 }
    )
  }
}
