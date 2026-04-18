import { env } from '@/lib/env'

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org'

async function telegramFetch<T>(method: string, body?: Record<string, unknown>) {
  const response = await fetch(
    `${TELEGRAM_API_BASE_URL}/bot${env.TELEGRAM_BOT_TOKEN}/${method}`,
    {
      method: body ? 'POST' : 'GET',
      headers: body
        ? {
            'Content-Type': 'application/json',
          }
        : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }
  )

  if (!response.ok) {
    throw new Error(`Telegram ${method} failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export async function sendTelegramMessage(input: {
  chatId: string | number
  text: string
  parseMode?: 'Markdown'
  replyMarkup?: Record<string, unknown>
}) {
  return telegramFetch('sendMessage', {
    chat_id: input.chatId,
    text: input.text,
    parse_mode: input.parseMode ?? 'Markdown',
    ...(input.replyMarkup ? { reply_markup: input.replyMarkup } : {}),
  })
}

export async function setTelegramWebhook(webhookUrl: string, secretToken?: string) {
  return telegramFetch('setWebhook', {
    url: webhookUrl,
    ...(secretToken ? { secret_token: secretToken } : {}),
  })
}

export async function getTelegramWebhookInfo() {
  return telegramFetch<{
    ok: boolean
    result: {
      url: string
      pending_update_count: number
      last_error_message?: string
    }
  }>('getWebhookInfo')
}

