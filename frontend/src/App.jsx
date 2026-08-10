import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landingPage/LandingPage.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  )
}