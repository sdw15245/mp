// 랜딩 페이지. Hero/HowItWorks/CharacterPreview/Cta/Footer 섹션을 조립하고 스크롤 네비게이션 처리.
import { useRef } from 'react'
import HeroSection from './HeroSection'
import HowItWorksSection from './HowItWorksSection'
import CharacterPreviewSection from './CharacterPreviewSection'
import CtaSection from './CtaSection'
import Footer from './Footer'
import LandingNavbar from './LandingNavbar'

function LandingPage() {
  const introRef = useRef<HTMLDivElement>(null)
  const charactersRef = useRef<HTMLDivElement>(null)
  const reviewsRef = useRef<HTMLDivElement>(null)

  const scrollTo = (key: 'intro' | 'characters' | 'reviews') => {
    const refs = {
      intro: introRef,
      characters: charactersRef,
      reviews: reviewsRef,
    }
    refs[key].current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div id="top" className="wf">
      <LandingNavbar onNavigate={scrollTo} />
      <HeroSection onNavigate={scrollTo} />
      <div ref={introRef}>
        <HowItWorksSection />
      </div>
      <div ref={charactersRef}>
        <CharacterPreviewSection />
      </div>
      <div ref={reviewsRef} />
      <CtaSection />
      <Footer />
    </div>
  )
}

export default LandingPage
