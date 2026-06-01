// 추천곡 조회(useSuspenseQuery) + 플레이리스트 저장(useMutation).
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { queryKeys } from '../../shared/api/queryKeys'
import { normalizeError } from '../../shared/api/error'
import { RecommendationsSchema, SavePlaylistSchema, type RecommendedTrack } from './schemas'

export function useRecommendations() {
  return useSuspenseQuery<RecommendedTrack[]>({
    queryKey: queryKeys.test.recommendations(),
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/test/recommendations')
        return RecommendationsSchema.parse(data)
      } catch (e) {
        throw normalizeError(e)
      }
    },
  })
}

export function useSavePlaylist() {
  return useMutation({
    mutationFn: async (vars: { uris: string[]; name?: string }) => {
      try {
        const { data } = await api.post('/api/test/recommendations/save', vars)
        return SavePlaylistSchema.parse(data)
      } catch (e) {
        throw normalizeError(e)
      }
    },
  })
}
