// React Query queryKey 중앙 관리. 도메인별 네임스페이스로 캐시 무효화/조회 일관성 확보.
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  test: {
    all: ['test'] as const,
    topTrack: () => [...queryKeys.test.all, 'topTrack'] as const,
    userVector: () => [...queryKeys.test.all, 'userVector'] as const,
    match: () => [...queryKeys.test.all, 'match'] as const,
    profile: () => [...queryKeys.test.all, 'profile'] as const,
    recommendations: () => [...queryKeys.test.all, 'recommendations'] as const,
  },
} as const
