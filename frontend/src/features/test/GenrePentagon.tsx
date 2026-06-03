// 장르 분포 top5 오각형(레이더) 차트. 외부 라이브러리 없이 SVG로 직접 그린다.
// 값은 top5 중 최댓값을 외곽에 맞춰 정규화(모양이 잘 보이게), 라벨엔 실제 % 표기.

const GENRE_LABELS: Record<string, string> = {
  pop: 'Pop',
  rock: 'Rock',
  indie: 'Indie',
  electronic: 'Electronic',
  'hip-hop': 'Hip-Hop',
  'r-and-b': 'R&B',
  jazz: 'Jazz',
  classical: 'Classical',
  folk: 'Folk',
  metal: 'Metal',
  latin: 'Latin',
  'k-pop': 'K-Pop',
  'j-pop': 'J-Pop',
}

const SIZE = 300
const CENTER = SIZE / 2
const RADIUS = 90
const AXES = 5

function point(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180
  return { x: CENTER + r * Math.cos(a), y: CENTER + r * Math.sin(a) }
}

const toPoints = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x},${p.y}`).join(' ')

export function GenrePentagon({ vector }: { vector: Record<string, number> }) {
  // 비중 큰 순 top5 (벡터는 13개 키가 다 있어 항상 5개 확보됨).
  const top = Object.entries(vector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, AXES)

  const max = Math.max(...top.map(([, v]) => v), 0.0001)
  // 각 축 각도: 맨 위(-90°)부터 시계방향 72°씩.
  const angles = top.map((_, i) => -90 + (360 / AXES) * i)

  const gridOuter = angles.map((ang) => point(ang, RADIUS))
  const gridMid = angles.map((ang) => point(ang, RADIUS * 0.5))
  const dataPts = top.map(([, v], i) => point(angles[i], RADIUS * (v / max)))

  return (
    <div className="pentagon-wrap">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="pentagon-svg" role="img" aria-label="장르 분포 오각형 그래프">
        {/* 격자 */}
        <polygon points={toPoints(gridOuter)} className="pentagon-grid" />
        <polygon points={toPoints(gridMid)} className="pentagon-grid" />
        {gridOuter.map((p, i) => (
          <line key={`axis-${i}`} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} className="pentagon-axis" />
        ))}

        {/* 데이터 영역 */}
        <polygon points={toPoints(dataPts)} className="pentagon-data" />
        {dataPts.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3.5} className="pentagon-dot" />
        ))}

        {/* 라벨 (장르명 + 실제 %) */}
        {top.map(([genre, v], i) => {
          const lp = point(angles[i], RADIUS + 24)
          const anchor = lp.x < CENTER - 1 ? 'end' : lp.x > CENTER + 1 ? 'start' : 'middle'
          return (
            <text
              key={genre}
              x={lp.x}
              y={lp.y}
              className="pentagon-label"
              textAnchor={anchor}
              dominantBaseline="middle"
            >
              {(GENRE_LABELS[genre] ?? genre)} {Math.round(v * 100)}%
            </text>
          )
        })}
      </svg>
    </div>
  )
}
