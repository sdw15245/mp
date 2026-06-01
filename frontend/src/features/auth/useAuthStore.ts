// 인증 상태(access/refresh 토큰) 전역 zustand 스토어. localStorage에 persist.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  setTokens: (access: string, refresh: string) => void
  setAccessToken: (access: string) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      setAccessToken: (access) => set({ accessToken: access }),
      clear: () => set({ accessToken: null, refreshToken: null }),
    }),
    { name: 'auth' },
  ),
)
