// 인증 관련 React Query 훅: 현재 사용자 조회(useMe), 로그아웃(useLogout).
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { queryKeys } from '../../shared/api/queryKeys'
import { normalizeError } from '../../shared/api/error'
import { MeSchema, type Me } from './schemas'
import { useAuthStore } from './useAuthStore'

export type { Me }

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken)

  return useQuery<Me>({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/me')
        return MeSchema.parse(data)
      } catch (e) {
        throw normalizeError(e)
      }
    },
    enabled: !!accessToken,
  })
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post('/api/auth/logout')
      } catch {
        // 토큰이 만료됐어도 클라이언트 상태는 비움
      }
    },
    onSettled: () => {
      clear()
      queryClient.clear()
    },
  })
}
