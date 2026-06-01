// 모든 API 에러를 ApiError로 정규화. axios/일반 Error 모두 통일된 형태로 변환.
import axios from 'axios'

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data as { message?: string; error?: string } | undefined
    const message = data?.message ?? data?.error ?? error.message
    return new ApiError(message, status, data?.error)
  }
  if (error instanceof Error) {
    return new ApiError(error.message, 0)
  }
  return new ApiError('알 수 없는 오류', 0)
}
