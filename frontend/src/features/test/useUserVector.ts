// /api/test/user-vector 호출 훅. useSuspenseQuery + Zod 검증.
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { queryKeys } from '../../shared/api/queryKeys'
import { normalizeError } from '../../shared/api/error'
import { UserVectorSchema, type UserVector } from './schemas'

export function useUserVector() {
  return useSuspenseQuery<UserVector>({
    queryKey: queryKeys.test.userVector(),
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/test/user-vector')
        return UserVectorSchema.parse(data)
      } catch (e) {
        throw normalizeError(e)
      }
    },
  })
}
