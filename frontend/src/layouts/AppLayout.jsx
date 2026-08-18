import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const NAV_ITEMS = {
    user: [
        { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/materi', label: 'Jelajah Materi', icon: 'book' },
        { path: '/kuis', label: 'Kuis', icon: 'clipboard' },
        { path: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
        { path: '/kelola-materi', label: 'Kelola Materi', icon: 'doc' },
        { path: '/kelola-kuis', label: 'Kelola Kuis', icon: 'quiz' },
    ],
    admin: [
        { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/users', label: 'Kelola Users', icon: 'users' },
        { path: '/admin/moderasi', label: 'Moderasi Konten', icon: 'shield' },
        { path: '/admin/xp', label: 'XP & Ranked', icon: 'cog' },
        { path: '/admin/logs', label: 'Audit & Log', icon: 'file' },
    ],
};

const ICON_PATHS = {
    dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
    clipboard: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M8 2h8v4H8zM9 14l2 2 4-4',
    trophy: 'M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
    doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2l6 6v12a2 2 0 0 0 2 2h-6M12 18v-6m0 0H9m3 0l3-3',
    quiz: 'M12 3L2 12h3v8h6v-6h2v6h6v-8h3zM9.5 9.5l1.5 1.5 3-3',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    cog: 'M12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4.93 4.93a1 1 0 0 1 1.42 0l.7.7a1 1 0 0 1-1.42 1.42l-.7-.7a1 1 0 0 1 0-1.42zM17.66 4.93a1 1 0 0 1 0 1.42l-.7.7a1 1 0 0 1-1.42-1.42l.7-.7a1 1 0 0 1 1.42 0zM4.93 19.07a1 1 0 0 1 0 1.42l-.7.7a1 1 0 0 1-1.42-1.42l.7-.7a1 1 0 0 1 1.42 0zM17.66 19.07a1 1 0 0 1 1.42 0l.7.7a1 1 0 0 1-1.42 1.42l-.7-.7a1 1 0 0 1 0-1.42zM12 2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zM5.05 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm10.9 0a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1z',
    file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
};

function NavIcon({ name, className = 'w-5 h-5' }) {
    const path = ICON_PATHS[name];
    if (!path) return null;
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={path} />
        </svg>
    );
}

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = user?.role === 'admin';
    const navItems = isAdmin ? NAV_ITEMS.admin : NAV_ITEMS.user;

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const getPageTitle = () => {
        const match = navItems.find(item => location.pathname === item.path);
        return match ? match.label : 'Dashboard';
    };

    return (
        <div className="flex min-h-screen bg-slate-100">
            <aside className="w-64 shrink-0 bg-navy text-white flex flex-col">
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <NavIcon name="dashboard" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-extrabold leading-none">LMS Gamifikasi</div>
                        <div className="text-white/40 text-[10px] mt-1">{isAdmin ? 'Admin Panel' : 'Dashboard'}</div>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-4">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/75 hover:bg-white/10 transition ${
                                location.pathname === item.path ? 'bg-primary text-white' : ''
                            }`}
                        >
                            <NavIcon name={item.icon} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm">
                            {user?.namaLengkap?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold truncate">{user?.namaLengkap}</div>
                            <div className="text-[11px] text-white/50 truncate">
                                {isAdmin ? 'Admin' : `User • XP: ${(user?.xpLearner || 0) + (user?.xpCreator || 0)}`}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2 rounded-lg transition"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Keluar
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-extrabold text-navy">{getPageTitle()}</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Lanjutkan perjalanan belajarmu hari ini.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-100 text-navy text-xs font-semibold px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Season 1 - Agustus 2026 (aktif)
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-6 max-w-6xl w-full mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
