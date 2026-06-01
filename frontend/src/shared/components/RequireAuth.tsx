// 로그인 가드. 토큰이 없으면 자식을 렌더하지 않고 /login으로 보낸다.
import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/useAuthStore'

function RequireAuth({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default RequireAuth
