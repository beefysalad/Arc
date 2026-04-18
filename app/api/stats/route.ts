import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { buildDashboardStats } from '@/lib/arc/stats'
import prisma from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const movies = await prisma.movie.findMany({
    where: { userId },
    orderBy: { watchedAt: 'desc' },
  })

  return NextResponse.json(buildDashboardStats(movies))
}
