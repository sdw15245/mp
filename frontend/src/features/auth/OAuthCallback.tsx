// OAuth 콜백 라우트. 쿼리스트링의 access/refresh를 스토어에 저장하고 홈으로 redirect.
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from './useAuthStore'

function OAuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)

  useEffect(() => {
    const access = params.get('access')
    const refresh = params.get('refresh')

    if (access && refresh) {
      setTokens(access, refresh)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [params, navigate, setTokens])

  return (
    <main className="auth-page">
      <section className="state-card" aria-live="polite">
        <div className="section-kicker">Login</div>
        <h1 className="wf-h3" style={{ marginBottom: 14 }}>Spotify 연결을 확인하고 있습니다</h1>
        <div className="skeleton-stack">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </section>
    </main>
  )
}

export default OAuthCallback
