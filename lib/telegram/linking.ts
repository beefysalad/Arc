import { env } from '@/lib/env'

export function getTelegramWebhookUrl() {
  if (!env.NEXT_PUBLIC_APP_URL) {
    throw new Error(
      'NEXT_PUBLIC_APP_URL is not configured. Set it to a public HTTPS URL before registering the Telegram webhook.'
    )
  }

  return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/telegram/webhook`
}
