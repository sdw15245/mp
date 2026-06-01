// /api/test/match 호출 훅. useSuspenseQuery + Zod 검증.
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { queryKeys } from '../../shared/api/queryKeys'
import { normalizeError } from '../../shared/api/error'
import { MatchSchema, type Match } from './schemas'

export function useMatch() {
  return useSuspenseQuery<Match>({
    queryKey: queryKeys.test.match(),
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/test/match')
        return MatchSchema.parse(data)
      } catch (e) {
        throw normalizeError(e)
      }
    },
  })
}
