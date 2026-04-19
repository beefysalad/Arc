export type MovieListItem = {
  id: string
  tmdbId: number
  title: string
  releaseYear: number | null
  posterPath: string | null
  genres: string[]
  runtime: number | null
  tmdbRating: number | null
  userRating: number | null
  note: string | null
  watchedAt: string
  createdAt: string
}

export type MovieSearchResult = {
  tmdbId: number
  title: string
  releaseYear: number | null
  posterPath: string | null
  genres: string[]
  runtime: number | null
  tmdbRating: number | null
  overview: string
}

export type GenreStat = {
  genre: string
  count: number
  avgRating: number | null
  weight: number
}

export type MovieHighlight = {
  id: string
  title: string
  releaseYear: number | null
  posterPath: string | null
  userRating: number | null
  tmdbRating: number | null
}

export type InsightResponse = {
  summary: string
  blindSpot: string
  patterns: string[]
  nextWatch: string
}

export type DashboardStats = {
  totalWatched: number
  avgRating: number | null
  topGenres: GenreStat[]
  bestRated: MovieHighlight | null
  worstRated: MovieHighlight | null
  watchStreak: number
}

export type TelegramLinkStatus = {
  linked: boolean
  telegramUsername: string | null
  telegramId: string | null
  linkedAt: string | null
}

export type TasteProfileSnapshot = {
  topGenres: GenreStat[]
  avgRating: number | null
  totalWatched: number
}
