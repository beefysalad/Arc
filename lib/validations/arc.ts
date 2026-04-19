import { z } from 'zod'

export const connectTelegramSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code from Telegram.'),
})

export const updateMovieSchema = z
  .object({
    userRating: z.number().int().min(1).max(10).nullable().optional(),
    note: z.string().trim().max(500).nullable().optional(),
  })
  .refine((value) => value.userRating !== undefined || value.note !== undefined, {
    message: 'Update at least one field.',
  })

export const movieFilterSchema = z.object({
  genre: z.string().trim().optional(),
  sort: z.enum(['date', 'rating']).optional().default('date'),
})

export const movieSearchSchema = z.object({
  query: z.string().trim().min(1, 'Enter a movie title.').max(120),
})

export const createMovieSchema = z.object({
  tmdbId: z.number().int().positive(),
})
