// 랜딩 하단 CTA 섹션. 스크롤 끝에서 다시 한 번 Spotify 시작 유도.
import { Link } from 'react-router-dom'

function CtaSection() {
  return (
    <section className="cta-section">
      <div className="section-shell cta-inner">
        <div>
          <div className="section-kicker">Ready</div>
          <h2 className="wf-h2">
            지금 듣는 음악으로<br />나의 펫을 만나보세요
          </h2>
          <p className="wf-sub">
            카드 등록 없이 Spotify만 연결합니다. 분석이 끝나면 취향 요약과 펫 캐릭터를 한 화면에서 볼 수 있어요.
          </p>
        </div>
        <Link to="/login" className="wf-btn green xl">Spotify로 시작하기</Link>
      </div>
    </section>
  )
}

export default CtaSection
