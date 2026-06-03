// 결과 공개 직전 연출용 스플래시(가짜 로딩). 표시 전용 컴포넌트.
// 노출/제거 타이밍은 부모(TestPage)가 "실제 데이터 준비 + 최소 시간"으로 제어한다.
import { useEffect, useState } from 'react'

const STEPS = [
  'Spotify 청취 기록을 읽는 중',
  '장르와 무드를 계산하는 중',
  '당신과 닮은 음악 펫을 찾는 중',
]

interface MatchSplashProps {
  /** true면 페이드아웃 시작 */
  leaving?: boolean
}

export function MatchSplash({ leaving }: MatchSplashProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length)
    }, 1100)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`match-splash${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite">
      <div className="match-splash-art">
        <span className="match-splash-ring" />
      </div>
      <p className="match-splash-text">{STEPS[step]}…</p>
      <div className="match-splash-dots" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span key={i} className={`match-splash-dot${i === step ? ' on' : ''}`} />
        ))}
      </div>
    </div>
  )
}
