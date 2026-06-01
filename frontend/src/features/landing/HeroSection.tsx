// 랜딩 히어로 섹션. 배경 비디오 + 메인 카피 + Spotify 시작 CTA.
import { Link } from 'react-router-dom'

interface HeroSectionProps {
  onNavigate?: (key: 'intro' | 'characters' | 'reviews') => void
}

function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="hero-fs">
      <video
        src="/videos/hero-1.mp4?v=5"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster=""
        onEnded={(e) => {
          const v = e.currentTarget
          v.currentTime = 0
          void v.play()
        }}
      />
      <div className="scrim" />

      <div className="section-shell hero-grid">
        <div className="hero-copy">
          <div className="section-kicker">Spotify taste match</div>
          <h1 className="wf-h1">
            Find your<br />music pet.
          </h1>
          <p className="wf-sub">
            자주 듣는 곡의 무드, 에너지, 장르를 읽고 당신과 닮은 음악 펫을 골라드려요.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="wf-btn green xl">Spotify로 시작하기</Link>
            <button className="wf-btn ghost xl" type="button" onClick={() => onNavigate?.('intro')}>
              어떻게 찾는지 보기
            </button>
          </div>
        </div>

        <aside className="hero-panel" aria-label="musicPets 분석 요약">
          <div className="hero-panel-title">
            <span>taste signal</span>
            <span>live</span>
          </div>
          <div className="hero-stat">
            <strong>15</strong>
            <span>음악 취향과 연결되는 펫 캐릭터</span>
          </div>
          <div className="hero-stat">
            <strong>10s</strong>
            <span>Spotify 연결 후 빠르게 보는 첫 분석</span>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default HeroSection
