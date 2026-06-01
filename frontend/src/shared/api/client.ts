// 백엔드 호출 전용 axios 인스턴스. Bearer 자동 첨부 + 401 시 refresh로 재시도.
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { BACKEND_URL } from './config'
import { useAuthStore } from '../../features/auth/useAuthStore'
import { RefreshResponseSchema } from '../../features/auth/schemas'

export const api = axios.create({
  baseURL: BACKEND_URL,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing: Promise<string> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    if (status === 401 && !original._retry) {
      original._retry = true
      const { refreshToken, setAccessToken, clear } = useAuthStore.getState()

      if (!refreshToken) {
        clear()
        redirectToLogin()
        return Promise.reject(error)
      }

      try {
        if (!refreshing) {
          refreshing = axios
            .post(`${BACKEND_URL}/api/auth/refresh`, { refresh: refreshToken })
            .then((r) => RefreshResponseSchema.parse(r.data).access)
            .finally(() => {
              refreshing = null
            })
        }
        const newAccess = await refreshing
        setAccessToken(newAccess)
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (e) {
        // refresh 실패 = 세션 만료 → 재로그인 필요
        clear()
        redirectToLogin()
        return Promise.reject(e)
      }
    }

    return Promise.reject(error)
  },
)

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}
