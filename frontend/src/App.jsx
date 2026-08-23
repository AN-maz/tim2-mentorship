import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landingPage/LandingPage.jsx';
import AuthView from './pages/auth/AuthView.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// Halaman-halaman fitur yang akan/sudah dibuat (Learner & Creator)
// import MateriListPage from './pages/materi/MateriListPage.jsx';
// import MateriDetailPage from './pages/materi/MateriDetailPage.jsx';
// import KuisListPage from './pages/kuis/KuisListPage.jsx';
// import KuisPlayPage from './pages/kuis/KuisPlayPage.jsx';
// import LeaderboardPage from './pages/leaderboard/LeaderboardPage.jsx';
// import KelolaMateriPage from './pages/creator/KelolaMateriPage.jsx';
// import KelolaKuisPage from './pages/creator/KelolaKuisPage.jsx';

// Halaman Admin
// import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
// import AdminModerasiPage from './pages/admin/AdminModerasiPage.jsx';
// import AdminXpPage from './pages/admin/AdminXpPage.jsx';
// import AdminLogsPage from './pages/admin/logs/AdminLogsPage.jsx';

export default function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthView />} />

            {/* Protected Routes (User & Admin yang login) */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                {/* General */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Learner Core */}
                {/* <Route path="/materi" element={<MateriListPage />} /> */}
                {/* <Route path="/materi/:id" element={<MateriDetailPage />} /> */}
                {/* <Route path="/kuis" element={<KuisListPage />} /> */}
                {/* <Route path="/kuis/:id" element={<KuisPlayPage />} /> */}
                {/* <Route path="/leaderboard" element={<LeaderboardPage />} /> */}

                {/* Creator Core */}
                {/* <Route path="/kelola-materi" element={<KelolaMateriPage />} /> */}
                {/* <Route path="/kelola-kuis" element={<KelolaKuisPage />} /> */}
            </Route>

            {/* Khusus Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']}><AppLayout /></ProtectedRoute>}>
                {/* <Route path="/admin/users" element={<AdminUsersPage />} /> */}
                {/* <Route path="/admin/moderasi" element={<AdminModerasiPage />} /> */}
                {/* <Route path="/admin/xp" element={<AdminXpPage />} /> */}
                {/* <Route path="/admin/logs" element={<AdminLogsPage />} /> */}
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}