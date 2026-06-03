import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'

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

export function GenrePentagon({ vector }: { vector: Record<string, number> }) {
  const data = Object.entries(vector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, value]) => ({
      genre: `${GENRE_LABELS[genre] ?? genre} ${Math.round(value * 100)}%`,
      value: Math.round(value * 100),
    }))

  return (
    <div className="pentagon-wrap">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="genre" tick={{ fontSize: 12 }} />
          <Radar dataKey="value" fill="#6366f1" fillOpacity={0.4} stroke="#6366f1" strokeWidth={2} dot={{ r: 3.5 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
