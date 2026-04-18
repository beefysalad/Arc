'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ExternalLink } from 'lucide-react'

import {
  useConnectTelegram,
  useRegisterTelegramWebhook,
  useTelegramConnection,
} from '@/hooks/use-arc'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { connectTelegramSchema } from '@/lib/validations/arc'

type ConnectValues = {
  code: string
}

export function SettingsDashboard() {
  const { data, isLoading } = useTelegramConnection()
  const connectTelegram = useConnectTelegram()
  const registerTelegramWebhook = useRegisterTelegramWebhook()
  const form = useForm<ConnectValues>({
    resolver: zodResolver(connectTelegramSchema),
    defaultValues: {
      code: '',
    },
  })

  async function onSubmit(values: ConnectValues) {
    const response = await connectTelegram.mutateAsync(values.code)
    toast.success(
      response.telegramUsername
        ? `Connected to @${response.telegramUsername}.`
        : 'Telegram account connected.'
    )
    form.reset()
  }

  async function handleRegisterWebhook() {
    const response = await registerTelegramWebhook.mutateAsync()
    toast.success(`Webhook registered: ${response.webhookUrl}`)
  }

  if (isLoading || !data) {
    return <div className="text-muted-foreground">Loading settings...</div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Connection</p>
        {data.linked ? (
          <>
            <h1 className="mt-3 text-3xl font-semibold">Telegram connected</h1>
            <p className="mt-3 text-muted-foreground">
              {data.telegramUsername
                ? `Arc is linked to @${data.telegramUsername}.`
                : 'Arc is linked to your Telegram account.'}
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-3xl font-semibold">Connect Telegram to Arc</h1>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>Open your Arc bot in Telegram.</li>
              <li>Send `/start` and copy the 6-digit code.</li>
              <li>Paste it here to link your dashboard and bot.</li>
            </ol>
          </>
        )}
      </Card>

      <Card className="border-white/10 bg-white/5 p-6">
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium">Register Telegram webhook</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Arc will point Telegram at your current <code>NEXT_PUBLIC_APP_URL</code> automatically.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleRegisterWebhook}
              disabled={registerTelegramWebhook.isPending}
            >
              {registerTelegramWebhook.isPending ? 'Registering...' : 'Register webhook'}
            </Button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="code">Link code</Label>
            <Input id="code" placeholder="123456" {...form.register('code')} />
            {form.formState.errors.code ? (
              <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={connectTelegram.isPending}>
            {connectTelegram.isPending ? 'Connecting...' : 'Connect Telegram'}
          </Button>
        </form>
        <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <ExternalLink className="size-4" />
          After the webhook is registered, send <code>/start</code> to your bot in Telegram.
        </p>
      </Card>
    </div>
  )
}
