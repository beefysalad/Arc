import { auth } from '@clerk/nextjs/server'
import { counterService } from '@/lib/services/counter-service'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

const counterSchema = z.object({
  value: z.number().int().min(0),
})

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const counter = await counterService.GetGlobalCounter()
    return NextResponse.json(counter)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch counter' }, { status: 500 })
  }
}

export async function POST() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const counter = await counterService.incrementGlobalCounter()
    return NextResponse.json(counter)
  } catch {
    return NextResponse.json(
      { error: 'Failed to increment counter' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = counterSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: fromZodError(result.error).message },
        { status: 400 }
      )
    }

    const counter = await counterService.setGlobalCounter(result.data.value)
    return NextResponse.json(counter)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update counter' },
      { status: 500 }
    )
  }
}
