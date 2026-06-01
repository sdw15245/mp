// /api/test/profile 호출 훅. 대중성 + LLM 취향 평. useSuspenseQuery + Zod 검증.
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { queryKeys } from '../../shared/api/queryKeys'
import { normalizeError } from '../../shared/api/error'
import { ProfileSchema, type Profile } from './schemas'

export function useProfile() {
  return useSuspenseQuery<Profile>({
    queryKey: queryKeys.test.profile(),
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/test/profile')
        return ProfileSchema.parse(data)
      } catch (e) {
        throw normalizeError(e)
      }
    },
  })
}
