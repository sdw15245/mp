// 로그인 진입 페이지. 버튼 클릭 시 백엔드 OAuth URL로 이동시켜 Spotify 인증 흐름 시작.
import { SPOTIFY_LOGIN_URL } from '../../shared/api/config'

function LoginPage() {
  const handleLogin = () => {
    window.location.href = SPOTIFY_LOGIN_URL
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-copy">
          <div>
            <div className="section-kicker">Spotify login</div>
            <h1 className="wf-h2">음악 펫 만나러 가기</h1>
          </div>
          <p className="wf-sub">
            Spotify 계정으로 로그인하면 최근 청취 데이터를 읽어 당신의 취향과 닮은 펫을 찾아드려요.
          </p>
          <button onClick={handleLogin} className="wf-btn green xl">
            Spotify로 로그인
          </button>
        </div>
        <div className="auth-art" aria-hidden="true">
          <span>mp</span>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
