// W2~W3 검증용 페이지. 사용자의 #1 top track + Last.fm 태그 + 장르 분포를 표시.
import AsyncBoundary from '../../shared/components/AsyncBoundary'
import { useTopTrack } from './useTopTrack'
import { useUserVector } from './useUserVector'
import { useMatch } from './useMatch'
import { useProfile } from './useProfile'
import { useRecommendations, useSavePlaylist } from './useRecommendations'
import { GenrePentagon } from './GenrePentagon'

function MatchContent() {
  const { data } = useMatch()
  const pct = Math.round(data.score * 100)

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

function TopTrackContent() {
  const { data } = useTopTrack()

  return (
    <section className="test-card">
      <div className="section-kicker">Top track</div>
      <h1 className="wf-h3">당신이 가장 많이 들은 곡</h1>
      <p className="track-title">{data.trackName}</p>
      <p className="track-artist">{data.artistName}</p>

      <h2 className="wf-h3" style={{ marginBottom: 12 }}>Last.fm 태그</h2>
      {data.tags.length === 0 ? (
        <p className="wf-sub">아직 태그가 없어요.</p>
      ) : (
        <div className="tag-list">
          {data.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

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

function TestPage() {
  return (
    <main className="test-page">
      <div className="test-stack">
        <AsyncBoundary>
          <MatchContent />
        </AsyncBoundary>
        <AsyncBoundary>
          <ProfileContent />
        </AsyncBoundary>
        <AsyncBoundary>
          <TopTrackContent />
        </AsyncBoundary>
        <AsyncBoundary>
          <GenreContent />
        </AsyncBoundary>
        <AsyncBoundary>
          <RecommendationsContent />
        </AsyncBoundary>
      </div>
    </main>
  )
}

export default TestPage
