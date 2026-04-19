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

const steps = [
  'Register the webhook from inside Arc.',
  'Open your bot in Telegram and send /start.',
  'Paste the six-digit code here once and you are done.',
]

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
        title="Connection should feel like a one-time setup, not a side quest."
        description="This page is now a clearer command center for the Telegram link: status on the left, setup path in the middle, and actions on the right."
        aside={
          <div className="grid gap-3">
            <StatusMiniCard label="Telegram" value={linkedLabel} icon={Bot} />
            <StatusMiniCard label="Webhook" value="Managed in-app" icon={RadioTower} />
          </div>
        }
      />

      <motion.section variants={stagger} className="grid gap-6 xl:grid-cols-[0.75fr_0.7fr_1.05fr]">
        <motion.div variants={fadeUp}>
          <Card className="arc-panel h-full p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                <ShieldCheck className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Status</p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                  {data.linked ? 'Already connected' : 'Waiting for connection'}
                </h2>
              </div>
            </div>

            <p className="mt-6 text-base leading-8 text-muted-foreground">
              {data.linked
                ? 'Arc is already linked. Logs and ratings from Telegram will keep syncing into the dashboard automatically.'
                : 'The bot is ready. Once you register the webhook and send /start, Arc will hand you the code needed to finish the link.'}
            </p>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="arc-panel h-full p-6">
            <p className="arc-chip">Setup flow</p>
            <div className="mt-6 grid gap-4">
              {steps.map((step, index) => (
                <div key={step} className="rounded-[1.35rem] border border-white/10 bg-black/25 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="arc-panel p-6">
            <div className="rounded-[1.45rem] border border-white/10 bg-black/25 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    Webhook registration
                  </p>
                  <p className="mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
                    Arc will point Telegram at your current <code>NEXT_PUBLIC_APP_URL</code> automatically.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-white/12 bg-[#111111]"
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
                  className="h-11 rounded-2xl border-white/10 bg-black/25"
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

            <div className="mt-6 rounded-[1.35rem] border border-white/10 bg-black/25 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-9 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                  <Link2 className="size-4 text-primary" />
                </div>
                <p className="text-sm leading-7 text-muted-foreground">
                  Once the webhook is registered, go to Telegram and send <code>/start</code>. Arc will reply with the exact code you need here.
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
    <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-3 text-sm leading-6">{value}</p>
    </div>
  )
}
