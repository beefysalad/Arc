import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { getCachedOrGenerateInsights } from '@/lib/arc/insights'

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const force = searchParams.get('force') === 'true'
  const result = await getCachedOrGenerateInsights({ clerkUserId: userId, force })

  return NextResponse.json({
    ...result.insights,
    lastInsightAt: result.lastInsightAt?.toISOString() ?? null,
    cached: result.cached,
  })
}
