// W2~W3 검증용 페이지. 사용자의 #1 top track + Last.fm 태그 + 장르 분포를 표시.
import { Suspense, useEffect, useState } from 'react'
import AsyncBoundary from '../../shared/components/AsyncBoundary'
import { MatchSplash } from './MatchSplash'
// import { useTopTrack } from './useTopTrack' // Top track 섹션 숨김
import { useUserVector } from './useUserVector'
import { useMatch } from './useMatch'
import { useProfile } from './useProfile'
import { useRecommendations, useSavePlaylist } from './useRecommendations'
import { GenrePentagon } from './GenrePentagon'
import { useUnlockedCharacters } from '../../shared/unlockedCharacters'

function MatchContent() {
  const { data } = useMatch()
  const pct = Math.round(data.score * 100)

  // 매칭된 캐릭터를 도감에 해금(랜딩 미리보기에서 선명해짐).
  const unlock = useUnlockedCharacters((s) => s.unlock)
  useEffect(() => {
    unlock(data.characterName)
  }, [unlock, data.characterName])

  return (
    <section className="test-card match-card">
      <div className="section-kicker">Your character</div>
      <div className="match-figure">
        <img className="match-img" src={data.imageUrl} alt={data.characterName} />
      </div>
      <h1 className="match-name">{data.characterName}</h1>
      <p className="match-score">{pct}% 매칭</p>
    </section>
  )
}

function ProfileContent() {
  const { data } = useProfile()
  const obscurity = Math.round(data.obscurity)

  return (
    <section className="test-card profile-card">
      <div className="section-kicker">Taste reading</div>
      <p className="profile-comment">{data.comment}</p>

      <div className="profile-meter">
        <div className="profile-meter-labels">
          <span>대중적</span>
          <span>마이너</span>
        </div>
        <div className="genre-track">
          <div className="genre-fill" style={{ width: `${obscurity}%` }} />
        </div>
        <p className="profile-meter-cap">마이너함 {obscurity}%</p>
      </div>
    </section>
  )
}

// Top track 섹션은 결과표에서 숨김 (필요 시 주석 해제)
// function TopTrackContent() {
//   const { data } = useTopTrack()
//
//   return (
//     <section className="test-card">
//       <div className="section-kicker">Top track</div>
//       <h1 className="wf-h3">당신이 가장 많이 들은 곡</h1>
//       <p className="track-title">{data.trackName}</p>
//       <p className="track-artist">{data.artistName}</p>
//
//       <h2 className="wf-h3" style={{ marginBottom: 12 }}>Last.fm 태그</h2>
//       {data.tags.length === 0 ? (
//         <p className="wf-sub">아직 태그가 없어요.</p>
//       ) : (
//         <div className="tag-list">
//           {data.tags.map((tag) => (
//             <span key={tag} className="tag-chip">
//               {tag}
//             </span>
//           ))}
//         </div>
//       )}
//     </section>
//   )
// }

function GenreContent() {
  const { data } = useUserVector()
  const hasData = Object.values(data.vector).some((v) => v > 0)

  return (
    <section className="test-card">
      <div className="section-kicker">Genre mix</div>
      <h2 className="wf-h3" style={{ marginBottom: 8 }}>당신의 장르 분포 (top 5)</h2>

      {hasData ? (
        <GenrePentagon vector={data.vector} />
      ) : (
        <p className="wf-sub">아직 분석할 장르가 없어요.</p>
      )}
    </section>
  )
}

function RecommendationsContent() {
  const { data } = useRecommendations()
  const save = useSavePlaylist()

  return (
    <section className="test-card">
      <div className="section-kicker">For you</div>
      <h2 className="wf-h3" style={{ marginBottom: 16 }}>취향 기반 추천곡</h2>

      {data.length === 0 ? (
        <p className="wf-sub">추천할 곡을 찾지 못했어요.</p>
      ) : (
        <>
          <ul className="reco-list">
            {data.map((t) => (
              <li key={t.uri} className="reco-row">
                {t.imageUrl ? (
                  <img className="reco-img" src={t.imageUrl} alt="" />
                ) : (
                  <div className="reco-img reco-img-empty" />
                )}
                <div className="reco-meta">
                  <p className="reco-name">{t.name}</p>
                  <p className="reco-artist">{t.artist}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="reco-actions">
            {save.data ? (
              <a className="wf-btn green" href={save.data.playlistUrl} target="_blank" rel="noreferrer">
                플레이리스트 열기 ↗
              </a>
            ) : (
              <button
                className="wf-btn green"
                disabled={save.isPending}
                onClick={() => save.mutate({ uris: data.map((t) => t.uri) })}
              >
                {save.isPending ? '저장 중…' : 'Spotify에 플레이리스트로 저장'}
              </button>
            )}
            {save.isError && (
              <p className="reco-error">
                저장 실패 — 다시 로그인해서 플레이리스트 권한을 허용해야 할 수 있어요.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}

// 결과의 핵심 카드(match·profile·userVector)가 모두 준비되면 onReady를 호출한다.
// suspense 훅을 사용하므로 셋 다 resolve될 때까지 자체 Suspense에서 대기.
// 콘텐츠 컴포넌트와 캐시를 공유하므로 추가 요청은 발생하지 않는다.
function ReadyGate({ onReady }: { onReady: () => void }) {
  useMatch()
  useProfile()
  useUserVector()
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

const MIN_SPLASH_MS = 3500
const FADE_MS = 400

function TestPage() {
  const [dataReady, setDataReady] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)
  const [hidden, setHidden] = useState(false)
  const ready = dataReady && minElapsed

  // 최소 노출 시간 보장
  useEffect(() => {
    const t = window.setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS)
    return () => clearTimeout(t)
  }, [])

  // 준비되면 페이드아웃 후 완전히 제거
  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => setHidden(true), FADE_MS)
    return () => clearTimeout(t)
  }, [ready])

  return (
    <>
      {/* 결과 트리가 처음부터 마운트되어 데이터를 미리 로딩한다.
          스플래시는 그 위를 덮는 오버레이로, 핵심 데이터 준비 + 최소 시간이
          모두 충족될 때 사라진다 → 결과가 바로 보인다(이중 대기 제거). */}
      {!hidden && <MatchSplash leaving={ready} />}
      <Suspense fallback={null}>
        <ReadyGate onReady={() => setDataReady(true)} />
      </Suspense>
      <main className="test-page">
      <div className="test-stack">
        <AsyncBoundary>
          <MatchContent />
        </AsyncBoundary>
        <AsyncBoundary>
          <ProfileContent />
        </AsyncBoundary>
        {/* Top track 섹션은 결과표에서 숨김 (필요 시 주석 해제)
        <AsyncBoundary>
          <TopTrackContent />
        </AsyncBoundary>
        */}
        <AsyncBoundary>
          <GenreContent />
        </AsyncBoundary>
        <AsyncBoundary>
          <RecommendationsContent />
        </AsyncBoundary>
      </div>
      </main>
    </>
  )
}

export default TestPage
