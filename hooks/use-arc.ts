'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import api from '@/lib/axios'
import type {
  DashboardStats,
  InsightResponse,
  MovieListItem,
  TelegramLinkStatus,
} from '@/lib/arc/types'

export function useMovies(filters: { genre?: string; sort: 'date' | 'rating' }) {
  return useQuery({
    queryKey: ['movies', filters],
    queryFn: async () => {
      const response = await api.get<MovieListItem[]>('/movies', {
        params: {
          ...(filters.genre ? { genre: filters.genre } : {}),
          sort: filters.sort,
        },
      })

      return response.data
    },
  })
}

export function useUpdateMovie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      id: string
      userRating?: number | null
      note?: string | null
    }) => {
      const response = await api.patch<MovieListItem>(`/movies/${input.id}`, {
        ...(input.userRating !== undefined ? { userRating: input.userRating } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
      })

      return response.data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['movies'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
        queryClient.invalidateQueries({ queryKey: ['insights'] }),
      ])
    },
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/stats')
      return response.data
    },
  })
}

export function useInsights(force = false) {
  return useQuery({
    queryKey: ['insights', force],
    queryFn: async () => {
      const response = await api.get<InsightResponse & { lastInsightAt: string | null; cached: boolean }>(
        '/insights',
        {
          params: force ? { force: true } : undefined,
        }
      )

      return response.data
    },
  })
}

export function useTelegramConnection() {
  return useQuery({
    queryKey: ['telegram-connection'],
    queryFn: async () => {
      const response = await api.get<TelegramLinkStatus>('/connect/telegram')
      return response.data
    },
  })
}

export function useConnectTelegram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (code: string) => {
      const response = await api.post<{ success: true; telegramUsername: string | null }>(
        '/connect/telegram',
        { code }
      )

      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['telegram-connection'] })
    },
  })
}

export function useRegisterTelegramWebhook() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<{ success: true; webhookUrl: string }>(
        '/integrations/telegram/webhook/register'
      )

      return response.data
    },
  })
}
