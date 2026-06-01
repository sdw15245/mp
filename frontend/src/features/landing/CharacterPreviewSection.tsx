// 랜딩의 캐릭터 미리보기 섹션. 매칭될 수 있는 펫 캐릭터 일부를 카드로 노출.
import type { CSSProperties } from 'react'
const chars = [
  { n: '모찌', type: '아늑한 몽상가', color: '#d8d0f2', tag: 'dream pop' },
  { n: '핍', type: '신난 장난꾸러기', color: '#f5c7d3', tag: 'dance' },
  { n: '봉봉', type: '차분한 학자', color: '#dceadb', tag: 'lo-fi' },
  { n: '유즈', type: '햇살 방랑자', color: '#f5e8a8', tag: 'indie' },
] as const

function CharacterPreviewSection() {
  return (
    <section className="characters-section section-pad">
      <div className="section-shell">
        <div className="section-head">
          <div>
            <div className="section-kicker">Characters</div>
            <h2 className="wf-h2">한 줄 취향보다 오래 남는 펫</h2>
          </div>
          <div>
            <p className="wf-sub">
              결과는 단순한 점수가 아니라 성격이 있는 캐릭터로 보여줍니다. 같은 장르를 들어도 무드와 반복 패턴에 따라 다른 펫이 나와요.
            </p>
            <button className="wf-btn ghost" type="button" style={{ marginTop: 20 }}>15마리 모두 보기</button>
          </div>
        </div>

        <div className="character-grid">
          {chars.map((c) => (
            <article key={c.n} className="character-card">
              <div className="pet-stage" style={{ '--pet-color': c.color } as CSSProperties} />
              <div className="character-meta">
                <div>
                  <strong>{c.n}</strong>
                  <span>{c.type}</span>
                </div>
                <div className="character-tag">{c.tag}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CharacterPreviewSection
