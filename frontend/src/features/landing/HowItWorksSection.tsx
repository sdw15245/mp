// 랜딩의 "이용 방법" 섹션. 3단계 흐름(연결→분석→매칭)을 카드 형태로 소개.
const steps = [
  { n: 1, t: 'Spotify 연결', d: '로그인하고 취향을 알려주세요.\n안전하게 데이터를 읽기만 해요.', color: 'mint',   icon: '🎧' },
  { n: 2, t: '취향 분석',    d: '장르 · 무드 · 에너지를\n섬세하게 분석해드려요.',                color: 'yellow', icon: '🔍' },
  { n: 3, t: '나의 펫 만나기', d: '15마리 중 단 한 마리,\n당신만의 펫이 등장합니다.',              color: 'pink',   icon: '🐾' },
] as const

function HowItWorksSection() {
  return (
    <section className="steps-section section-pad">
      <div className="section-shell">
        <div className="section-head">
          <div>
            <div className="section-kicker">How it works</div>
            <h2 className="wf-h2">딱 10초면 취향의 윤곽이 보여요</h2>
          </div>
          <p className="wf-sub">
            복잡한 설문 대신 Spotify 청취 신호를 읽어 무드와 에너지를 정리하고, 그 결과를 펫 캐릭터로 바꿔 보여줍니다.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((s) => (
            <article key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <div className="step-icon" aria-hidden="true">{s.icon}</div>
              <div className="step-copy">
                <h3 className="wf-h3">{s.t}</h3>
                <p className="wf-sub">{s.d}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
