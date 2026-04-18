import { subDays } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

import { ask } from '@/lib/bot/gemini'
import { discoverMovies, getGenreIdsByNames } from '@/lib/bot/tmdb'
import { sendMessage } from '@/lib/bot/telegram'
import { buildTasteProfileSnapshot } from '@/lib/arc/stats'
import { env } from '@/lib/env'
import prisma from '@/lib/prisma'

async function buildWeeklyDigest(clerkUserId: string) {
  const movies = await prisma.movie.findMany({
    where: { userId: clerkUserId },
    orderBy: { watchedAt: 'desc' },
  })

  const weekAgo = subDays(new Date(), 7)
  const weekMovies = movies.filter((movie) => movie.watchedAt >= weekAgo)

  if (weekMovies.length === 0) {
    const lastMovie = movies[0]

    if (!lastMovie) {
      return 'Nothing logged this week. Arc is ready when you are.'
    }

    const daysAgo = Math.max(
      1,
      Math.floor((Date.now() - lastMovie.watchedAt.getTime()) / (1000 * 60 * 60 * 24))
    )

    return `Nothing logged this week. Arc noticed your last watch was ${lastMovie.title} ${daysAgo} days ago — maybe tonight?`
  }

  const snapshot = buildTasteProfileSnapshot(movies)
  const genreIds = await getGenreIdsByNames(snapshot.topGenres.slice(0, 2).map((genre) => genre.genre))
  const candidates = await discoverMovies({
    genreIds,
    excludeIds: movies.map((movie) => movie.tmdbId),
  })

  const candidateBlock =
    candidates.length > 0
      ? candidates
          .slice(0, 5)
          .map(
            (movie) =>
              `- ${movie.title}${movie.year ? ` (${movie.year})` : ''}; genres=${movie.genres.map((genre) => genre.name).join(', ')}; tmdb=${movie.tmdbRating ?? 'Unknown'}`
          )
          .join('\n')
      : `- ${weekMovies[0]?.title ?? movies[0]?.title ?? 'No candidate'}; reason=Use one of the provided weekly titles as a fallback reference only if no unwatched candidate exists.`

  const digest = await ask(`Write a message in this exact shape:
Arc — weekly recap

{2-3 sentences summarizing their week: what they watched, a pattern you noticed, and something slightly personal based on ratings}

Up next: {title} — {one line reason why}

Weekly movies:
${weekMovies
  .map(
    (movie) =>
      `- ${movie.title}${movie.releaseYear ? ` (${movie.releaseYear})` : ''}; genres=${movie.genres.join(', ')}; rating=${movie.userRating ?? 'Unrated'}`
  )
  .join('\n')}

Taste profile: ${JSON.stringify(snapshot)}.
Candidates for Up next:
${candidateBlock}

Rules:
- Use only the weekly movies and candidate list above.
- Do not hallucinate titles.
- Keep the overall message concise.`)

  return digest
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization')

  if (authorization !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const telegramUsers = await prisma.telegramUser.findMany()
  let sent = 0

  for (const telegramUser of telegramUsers) {
    const message = await buildWeeklyDigest(telegramUser.clerkUserId)
    await sendMessage(telegramUser.telegramId, message)
    sent += 1
  }

  return NextResponse.json({ sent })
}
