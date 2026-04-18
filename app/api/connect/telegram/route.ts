import { Prisma } from '@/app/generated/prisma/client'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { connectTelegramSchema } from '@/lib/validations/arc'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const telegramUser = await prisma.telegramUser.findUnique({
    where: { clerkUserId: userId },
  })

  return NextResponse.json({
    linked: !!telegramUser,
    telegramUsername: telegramUser?.telegramUsername ?? null,
    telegramId: telegramUser?.telegramId ?? null,
    linkedAt: telegramUser?.linkedAt.toISOString() ?? null,
  })
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const input = connectTelegramSchema.parse(body)

  const pendingLink = await prisma.pendingLink.findUnique({
    where: { code: input.code },
  })

  if (!pendingLink) {
    return NextResponse.json({ error: 'Invalid link code.' }, { status: 404 })
  }

  if (pendingLink.expiresAt.getTime() < Date.now()) {
    await prisma.pendingLink.delete({ where: { id: pendingLink.id } })
    return NextResponse.json({ error: 'This link code has expired.' }, { status: 400 })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const telegramUser = await tx.telegramUser.upsert({
        where: { clerkUserId: userId },
        update: {
          telegramId: pendingLink.telegramId,
          telegramUsername: pendingLink.telegramUsername,
          linkedAt: new Date(),
        },
        create: {
          clerkUserId: userId,
          telegramId: pendingLink.telegramId,
          telegramUsername: pendingLink.telegramUsername,
        },
      })

      await tx.pendingLink.delete({
        where: { id: pendingLink.id },
      })

      return telegramUser
    })

    return NextResponse.json({
      success: true,
      telegramUsername: result.telegramUsername,
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'That Telegram account is already linked to another Arc user.' },
        { status: 409 }
      )
    }

    throw error
  }
}
