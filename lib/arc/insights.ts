import { z } from 'zod'

import { ask } from '@/lib/bot/gemini'
import { INSIGHT_CACHE_HOURS } from '@/lib/arc/constants'
import { buildTasteProfileSnapshot } from '@/lib/arc/stats'
import type { InsightResponse } from '@/lib/arc/types'
import prisma from '@/lib/prisma'

const insightSchema = z.object({
  summary: z.string().min(1),
  blindSpot: z.string().min(1),
  patterns: z.array(z.string().min(1)).length(3),
  nextWatch: z.string().min(1),
})

type MovieHistoryEntry = {
  title: string
  releaseYear: number | null
  genres: string[]
  runtime: number | null
  tmdbRating: number | null
  userRating: number | null
  note: string | null
  watchedAt: string
}

function formatHistory(movies: MovieHistoryEntry[]) {
  return movies
    .map(
      (movie) =>
        `- ${movie.title}${movie.releaseYear ? ` (${movie.releaseYear})` : ''}; genres=${movie.genres.join(', ') || 'Unknown'}; runtime=${movie.runtime ?? 'Unknown'}; tmdb=${movie.tmdbRating ?? 'Unknown'}; user=${movie.userRating ?? 'Unrated'}; watchedAt=${movie.watchedAt}; note=${movie.note ?? 'None'}`
    )
    .join('\n')
}

function parseInsightResponse(response: string): InsightResponse {
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  const payload = jsonMatch ? jsonMatch[0] : response
  const parsed = JSON.parse(payload)

  return insightSchema.parse(parsed)
}

export async function generateInsightsFromMovies(input: {
  clerkUserId: string
  movies: MovieHistoryEntry[]
}) {
  const snapshot = buildTasteProfileSnapshot(
    input.movies.map((movie) => ({
      id: movie.title,
      title: movie.title,
      releaseYear: movie.releaseYear,
      posterPath: null,
      genres: movie.genres,
      watchedAt: movie.watchedAt,
      userRating: movie.userRating,
      tmdbRating: movie.tmdbRating,
    }))
  )

  const prompt = `Return strict JSON with keys summary, blindSpot, patterns, nextWatch.
App: Arc.
User profile snapshot: ${JSON.stringify(snapshot)}.
Watch history:
${formatHistory(input.movies)}

Rules:
- Ground every statement in the watch history and ratings above.
- Do not invent movie titles unless it is the single nextWatch recommendation.
- patterns must contain exactly 3 short strings.
- summary should be one paragraph.
- blindSpot should name one genre they have not explored much and why it fits.
- nextWatch should be one specific movie and a short reason.`

  const response = await ask(prompt)

  return parseInsightResponse(response)
}

export async function getCachedOrGenerateInsights(options: {
  clerkUserId: string
  force?: boolean
}) {
  const [movies, tasteProfile] = await Promise.all([
    prisma.movie.findMany({
      where: { userId: options.clerkUserId },
      orderBy: { watchedAt: 'desc' },
      select: {
        title: true,
        releaseYear: true,
        genres: true,
        runtime: true,
        tmdbRating: true,
        userRating: true,
        note: true,
        watchedAt: true,
      },
    }),
    prisma.tasteProfile.findUnique({
      where: { clerkUserId: options.clerkUserId },
      select: {
        lastInsight: true,
        lastInsightAt: true,
      },
    }),
  ])

  const now = Date.now()
  const maxAgeMs = INSIGHT_CACHE_HOURS * 60 * 60 * 1000
  const isFresh =
    !!tasteProfile?.lastInsight &&
    !!tasteProfile.lastInsightAt &&
    now - tasteProfile.lastInsightAt.getTime() < maxAgeMs

  if (!options.force && isFresh) {
    return {
      insights: insightSchema.parse(tasteProfile.lastInsight),
      lastInsightAt: tasteProfile.lastInsightAt,
      cached: true,
    }
  }

  if (movies.length === 0) {
    const emptyInsights = {
      summary: 'Arc needs a little more data before it can sketch your movie personality. Start by logging a few watches and ratings.',
      blindSpot: 'Try logging a few movies first so Arc can spot the genre you are skipping.',
      patterns: [
        'No viewing pattern yet because your library is still empty.',
        'Ratings will sharpen the difference between curiosity watches and true favorites.',
        'Once you log a streak, Arc can start calling out pace, mood, and blind spots.',
      ],
      nextWatch: 'Log your first movie in Telegram, then come back and Arc will make this specific.',
    } satisfies InsightResponse

    return {
      insights: emptyInsights,
      lastInsightAt: null,
      cached: false,
    }
  }

  const snapshot = buildTasteProfileSnapshot(
    movies.map((movie) => ({
      id: movie.title,
      title: movie.title,
      releaseYear: movie.releaseYear,
      posterPath: null,
      genres: movie.genres,
      watchedAt: movie.watchedAt,
      userRating: movie.userRating,
      tmdbRating: movie.tmdbRating,
    }))
  )

  const insights = await generateInsightsFromMovies({
    clerkUserId: options.clerkUserId,
    movies: movies.map((movie) => ({
      ...movie,
      watchedAt: movie.watchedAt.toISOString(),
    })),
  })

  const updated = await prisma.tasteProfile.upsert({
    where: { clerkUserId: options.clerkUserId },
    update: {
      topGenres: snapshot.topGenres,
      avgRating: snapshot.avgRating,
      lastInsight: insights,
      lastInsightAt: new Date(),
      totalWatched: movies.length,
    },
    create: {
      clerkUserId: options.clerkUserId,
      topGenres: snapshot.topGenres,
      avgRating: snapshot.avgRating,
      totalWatched: movies.length,
      lastInsight: insights,
      lastInsightAt: new Date(),
    },
  })

  return {
    insights,
    lastInsightAt: updated.lastInsightAt,
    cached: false,
  }
}
