import { env } from '@/lib/env'

export async function sendMessage(
  chatId: string | number,
  text: string,
  options?: {
    replyMarkup?: Record<string, unknown>
  }
) {
  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        ...(options?.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Telegram sendMessage failed: ${errorText}`)
  }
}
