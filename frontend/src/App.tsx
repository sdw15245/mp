// 앱 라우팅 정의. path → 페이지 컴포넌트 매핑.
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './features/landing/LandingPage'
import LoginPage from './features/auth/LoginPage'
import OAuthCallback from './features/auth/OAuthCallback'
import TestPage from './features/test/TestPage'
import RequireAuth from './shared/components/RequireAuth'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/test"
          element={
            <RequireAuth>
              <TestPage />
            </RequireAuth>
          }
        />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
