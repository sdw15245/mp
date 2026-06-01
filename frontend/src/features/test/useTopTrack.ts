// /api/test/top-track 호출 훅. useSuspenseQuery + Zod 검증.
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { queryKeys } from '../../shared/api/queryKeys'
import { normalizeError } from '../../shared/api/error'
import { TopTracksSchema, type TopTrack } from './schemas'

export function useTopTrack() {
  return useSuspenseQuery<TopTrack>({
    queryKey: queryKeys.test.topTrack(),
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/test/top-tracks')
        const tracks = TopTracksSchema.parse(data)
        if (tracks.length === 0) {
          throw new Error('top track 데이터가 없습니다')
        }
        // 백엔드는 top 10 리스트를 반환하지만 이 페이지는 1위 곡만 보여준다.
        return tracks[0]
      } catch (e) {
        throw normalizeError(e)
      }
    },
  })
}
