import { useAuth } from '../../hooks/useAuth.js';

function RankChip({ rank }) {
    const tiers = {
        Unranked: { color: 'text-slate-500', bg: 'bg-slate-100' },
        Bronze: { color: 'text-amber-800', bg: 'bg-amber-100' },
        Silver: { color: 'text-slate-600', bg: 'bg-slate-200' },
        Gold: { color: 'text-amber-600', bg: 'bg-amber-100' },
        Platinum: { color: 'text-slate-600', bg: 'bg-slate-200' },
        Diamond: { color: 'text-cyan-600', bg: 'bg-cyan-100' },
    };
    const t = tiers[rank] || tiers.Unranked;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${t.color} ${t.bg}`}>
            {rank.toUpperCase()}
        </span>
    );
}

function XPBar({ totalXP }) {
    const thresholds = [
        { name: 'Bronze', threshold: 100 },
        { name: 'Silver', threshold: 250 },
        { name: 'Gold', threshold: 500 },
        { name: 'Platinum', threshold: 1000 },
        { name: 'Diamond', threshold: 2000 },
    ];

    const next = thresholds.find(t => totalXP < t.threshold);
    if (!next) {
        return <div className="text-xs text-slate-500">Rank tertinggi tercapai: <b>Diamond</b></div>;
    }

    const pct = Math.min(100, Math.round((totalXP / next.threshold) * 100));

    return (
        <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Total XP: {totalXP} / {next.threshold}</span>
                <span>Menuju {next.name}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500" style={{ width: `${pct}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
                {next.threshold - totalXP} XP lagi untuk naik ke <b>{next.name}</b>
            </div>
        </div>
    );
}

function ActivityFeed({ activities }) {
    if (!activities.length) {
        return <p className="text-sm text-slate-400">Belum ada aktivitas. Mulai belajar sekarang!</p>;
    }

    const icons = {
        baca: 'book',
        kuis: 'clipboard',
    };

    return (
        <div className="space-y-3">
            {activities.slice(0, 5).map((act, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {icons[act.type] === 'book'
                                ? <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                : <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M8 2h8v4H8zM9 14l2 2 4-4" />}
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                            {act.type === 'baca' ? `Membaca materi #${act.id}` : `Menyelesaikan kuis #${act.id} (skor ${act.skor || '-'})`}
                        </div>
                        <div className="text-xs text-slate-400">{act.tanggal}</div>
                    </div>
                    <div className="text-xs font-bold text-amber-500">+{act.xp} XP</div>
                </div>
            ))}
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();

    if (!user) return null;

    const totalXP = (user.xpLearner || 0) + (user.xpCreator || 0);
    const myRank = user.rankPeringkat || 'Unranked';

    const mockActivities = [
        { type: 'baca', id: 1, xp: 10, tanggal: '2026-08-15 08:30' },
        { type: 'kuis', id: 1, xp: 30, skor: 80, tanggal: '2026-08-14 14:20' },
        { type: 'baca', id: 2, xp: 10, tanggal: '2026-08-13 19:10' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="text-xs font-bold text-slate-400">XP LEARNER</div>
                    <div className="text-3xl font-extrabold text-primary mt-1">{user.xpLearner || 0}</div>
                    <div className="text-xs text-slate-400 mt-1">Dari belajar</div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="text-xs font-bold text-slate-400">XP CREATOR</div>
                    <div className="text-3xl font-extrabold text-amber-500 mt-1">{user.xpCreator || 0}</div>
                    <div className="text-xs text-slate-400 mt-1">Dari berbagi ilmu</div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="text-xs font-bold text-slate-400">TOTAL XP</div>
                    <div className="text-3xl font-extrabold text-navy mt-1">{totalXP}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <RankChip rank={myRank} />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="text-xs font-bold text-slate-400">RIWAYAT</div>
                    <div className="text-3xl font-extrabold text-navy mt-1">3</div>
                    <div className="text-xs text-slate-400 mt-1">2 materi, 1 kuis</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-extrabold text-navy">Progress Peringkat</h3>
                            <RankChip rank={myRank} />
                        </div>
                        <XPBar totalXP={totalXP} />
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-extrabold text-navy mb-4">Aktivitas Terakhir</h3>
                        <ActivityFeed activities={mockActivities} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-navy rounded-2xl p-6 text-white">
                        <h3 className="font-extrabold mb-1">Mulai Belajar</h3>
                        <p className="text-white/60 text-sm mb-4">Temukan materi menarik dari kreator lain.</p>
                        <button className="w-full bg-primary hover:bg-blue-600 py-2.5 rounded-xl text-sm font-bold transition">
                            Jelajah Materi
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-extrabold text-navy mb-3">Menjadi Kreator</h3>
                        <p className="text-slate-500 text-sm mb-4">Bagikan ilmu dan kumpulkan XP Creator.</p>
                        <button className="w-full border-2 border-primary text-primary hover:bg-blue-50 py-2.5 rounded-xl text-sm font-bold transition">
                            + Upload Materi
                        </button>
                        <button className="w-full mt-2 border-2 border-amber-500 text-amber-500 hover:bg-amber-50 py-2.5 rounded-xl text-sm font-bold transition">
                            + Buat Kuis
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}