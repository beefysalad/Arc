'use client'

import { motion } from 'framer-motion'

import { fadeUp } from '@/components/arc/motion-primitives'
import { cn } from '@/lib/utils'

type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
  aside?: React.ReactNode
  className?: string
}

export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
  className,
}: PageIntroProps) {
  return (
    <motion.section
      variants={fadeUp}
      className={cn(
        'arc-panel relative overflow-hidden p-6 sm:p-8',
        className
      )}
    >
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>
        {aside ? <div className="relative lg:max-w-sm">{aside}</div> : null}
      </div>
    </motion.section>
  )
}
