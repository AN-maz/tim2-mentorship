import { supabase } from '../lib/supabase';

export const leaderboardService = {
  getLeaderboard: async (category = 'total') => {
    const { data, error } = await supabase
      .from('pengguna')
      .select('id_akun, nama_lengkap, xp_learner, xp_creator, total_xp, rank_peringkat')
      .order(
        category === 'learner' ? 'xp_learner'
          : category === 'creator' ? 'xp_creator'
          : 'total_xp',
        { ascending: false }
      )
      .limit(100);

    if (error) return { success: false, error: error.message };

    const { data: { user } } = await supabase.auth.getUser();

    const position = data.findIndex(p => p.id_akun === user?.id) + 1;
    const myEntry = data.find(p => p.id_akun === user?.id);

    return {
      success: true,
      data: data.map((p, idx) => ({
        rank: idx + 1,
        idAkun: p.id_akun,
        namaLengkap: p.nama_lengkap,
        totalXP: p.total_xp,
        xpLearner: p.xp_learner,
        xpCreator: p.xp_creator,
        rankPeringkat: p.rank_peringkat,
      })),
      userPosition: position > 0 ? position : null,
      userRank: myEntry?.rank_peringkat || null,
    };
  },
};
