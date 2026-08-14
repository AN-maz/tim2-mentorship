import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landingPage/LandingPage.jsx'
import AuthView from './pages/auth/AuthView.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthView/>}/>
      <Route path="*" element={<LandingPage />} />
    </Routes>
  )
}