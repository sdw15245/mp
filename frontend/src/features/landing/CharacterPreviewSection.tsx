// 랜딩의 캐릭터 미리보기 섹션. 매칭될 수 있는 펫 캐릭터 일부를 카드로 노출.
import type { CSSProperties } from 'react'
import { useUnlockedCharacters } from '../../shared/unlockedCharacters'
// img: 임시 캐릭터 이미지. /public/characters/ 에 저장된 파일을 참조.
const chars = [
  { n: '모찌', type: '아늑한 몽상가', color: '#d8d0f2', tag: 'dream pop', img: '/characters/mochi.png' },
  { n: '핍', type: '신난 장난꾸러기', color: '#f5c7d3', tag: 'dance', img: '/characters/pip.png' },
  { n: '봉봉', type: '차분한 학자', color: '#dceadb', tag: 'lo-fi', img: '/characters/bongbong.png' },
  { n: '유즈', type: '햇살 방랑자', color: '#f5e8a8', tag: 'indie', img: '/characters/yuze.png' },
] as const

function CharacterPreviewSection() {
  // 매칭으로 획득한 캐릭터만 선명하게 공개(도감 해금). 나머지는 잠금(흐릿).
  const unlocked = useUnlockedCharacters((s) => s.unlocked)

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
          {chars.map((c) => {
            const isUnlocked = unlocked.includes(c.n)
            return (
            <article key={c.n} className="character-card">
              <div className="pet-stage has-img" style={{ '--pet-color': c.color } as CSSProperties}>
                <img
                  className={`pet-img${isUnlocked ? '' : ' is-locked'}`}
                  src={c.img}
                  alt={isUnlocked ? c.n : '잠긴 캐릭터'}
                  loading="lazy"
                />
                {!isUnlocked && <span className="pet-lock" aria-hidden="true">?</span>}
              </div>
              <div className="character-meta">
                <div>
                  <strong>{c.n}</strong>
                  <span>{c.type}</span>
                </div>
                <div className="character-tag">{c.tag}</div>
              </div>
            </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CharacterPreviewSection
