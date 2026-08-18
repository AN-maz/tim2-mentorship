import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landingPage/LandingPage.jsx';
import AuthView from './pages/auth/AuthView.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthView />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}