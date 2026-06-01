// 랜딩 상단 네비게이션. 항상 상단 고정 (fixed). 스크롤 0일 땐 투명/흰 글자, 50px+ 스크롤 시 흰 배경/검은 글자.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMe, useLogout } from '../auth/useAuth'

interface LandingNavbarProps {
  onNavigate?: (key: 'intro' | 'characters' | 'reviews') => void
}

function LandingNavbar({ onNavigate }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handle = (k: 'intro' | 'characters' | 'reviews') => () => onNavigate?.(k)
  const { data: me } = useMe()
  const logout = useLogout()

  return (
    <nav className={`navbar nav-fixed${scrolled ? ' scrolled' : ''}`}>
      <Link to="/" className="logo">
        <span>musicPets</span>
      </Link>
      <div className="nav-actions">
        <button className="nav-link" onClick={handle('intro')}>소개</button>
        <button className="nav-link" onClick={handle('intro')}>이용 방법</button>
        <button className="nav-link" onClick={handle('characters')}>캐릭터</button>
        <Link to="/test" className="nav-link">테스트</Link>

        {me ? (
          <>
            <span className="nav-user">{me.displayName || me.spotifyId}</span>
            <button
              className="wf-btn green sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/login" className="wf-btn green sm">Spotify 연결하기</Link>
        )}
      </div>
    </nav>
  )
}

export default LandingNavbar
