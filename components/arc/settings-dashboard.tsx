'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Bot, Link2, RadioTower, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageIntro } from '@/components/arc/page-intro'
import { fadeUp, stagger } from '@/components/arc/motion-primitives'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useConnectTelegram,
  useRegisterTelegramWebhook,
  useTelegramConnection,
} from '@/hooks/use-arc'
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

  const linkedLabel = data.telegramUsername
    ? `Linked to @${data.telegramUsername}`
    : data.linked
      ? 'Linked to your Telegram account'
      : 'Not connected yet'

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show">
      <PageIntro
        eyebrow="Arc Settings"
        title="Connect the bot once, then let the rest stay invisible."
        description="Arc keeps the Telegram setup lightweight: register the webhook from inside the app, send /start in chat, and paste the six-digit code here to link everything together."
        aside={
          <div className="grid gap-3">
            <StatusMiniCard label="Telegram" value={linkedLabel} icon={Bot} />
            <StatusMiniCard
              label="Webhook"
              value="Managed in-app"
              icon={RadioTower}
            />
          </div>
        }
      />

      <motion.section variants={stagger} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={fadeUp}>
          <Card className="arc-panel h-full p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                <ShieldCheck className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Connection status</p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                  {data.linked ? 'Telegram connected' : 'Connect Telegram to Arc'}
                </h2>
              </div>
            </div>

            {data.linked ? (
              <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">
                Arc is already linked. New logs and ratings from Telegram will keep flowing into your dashboard automatically.
              </p>
            ) : (
              <ol className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
                <li>1. Open your Arc bot in Telegram.</li>
                <li>2. Send <code>/start</code> and copy the six-digit code.</li>
                <li>3. Paste it here once, and the dashboard will stay linked after that.</li>
              </ol>
            )}
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="arc-panel p-6">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/7 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Webhook registration
                  </p>
                  <p className="mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
                    Arc will point Telegram at your current <code>NEXT_PUBLIC_APP_URL</code> automatically.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={handleRegisterWebhook}
                  disabled={registerTelegramWebhook.isPending}
                >
                  {registerTelegramWebhook.isPending ? 'Registering...' : 'Register webhook'}
                </Button>
              </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="code">Link code</Label>
                <Input
                  id="code"
                  placeholder="123456"
                  className="h-11 rounded-2xl border-white/10 bg-white/8"
                  {...form.register('code')}
                />
                {form.formState.errors.code ? (
                  <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                ) : null}
              </div>

              <Button type="submit" disabled={connectTelegram.isPending} className="rounded-full px-6">
                {connectTelegram.isPending ? 'Connecting...' : 'Connect Telegram'}
              </Button>
            </form>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-9 items-center justify-center rounded-2xl bg-white/8">
                  <Link2 className="size-4" />
                </div>
                <p className="text-sm leading-7 text-muted-foreground">
                  Once the webhook is registered, head back to Telegram and send <code>/start</code>. Arc will reply with the link code you need here.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.section>
    </motion.div>
  )
}

function StatusMiniCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Bot
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/7 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm leading-6">{value}</p>
    </div>
  )
}
