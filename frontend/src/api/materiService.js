import { supabase } from '../lib/supabase';

export const materiService = {
  getAllMateri: async (params = {}) => {
    const { keyword } = params;
    let query = supabase
      .from('materi')
      .select('id_materi, judul_materi, id_penulis, nama_penulis, rating_rata2, total_dilihat, tanggal_ungghap, status_publik')
      .eq('status_publik', true)
      .order('tanggal_ungghap', { ascending: false });

    if (keyword) {
      query = query.ilike('judul_materi', `%${keyword}%`);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  getMateriById: async (id) => {
    const { data, error } = await supabase
      .from('materi')
      .select('*, komentar(id_komentar, id_pengguna, nama_pengguna, teks_komentar, tanggal, tanggal_edit), rating:rating(nilai_rating, id_pengguna)')
      .eq('id_materi', id)
      .eq('status_publik', true)
      .single();

    if (error) return { success: false, error: error.message };

    await supabase.rpc('increment_view', { materi_id: id });

    return { success: true, data };
  },

  searchMateri: async (keyword) => {
    return materiService.getAllMateri({ keyword });
  },

  giveRating: async (idMateri, nilaiRating) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('rating')
      .upsert({
        id_materi: idMateri,
        id_pengguna: user.id,
        nilai_rating: nilaiRating,
      }, { onConflict: 'id_materi,id_pengguna' });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  updateRating: async (idMateri, nilaiRating) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('rating')
      .update({ nilai_rating: nilaiRating })
      .eq('id_materi', idMateri)
      .eq('id_pengguna', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  addComment: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: result, error } = await supabase
      .from('komentar')
      .insert({
        ...data,
        id_pengguna: user.id,
        nama_pengguna: user.user_metadata?.full_name || user.email,
      });

    if (error) return { success: false, error: error.message };
    return { success: true, data: result };
  },

  editComment: (id, data) => supabase.from('komentar').update(data).eq('id_komentar', id),

  deleteComment: (id) => supabase.from('komentar').delete().eq('id_komentar', id),

  completeMateri: async (data) => {
    const { idMateri } = data;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: result, error } = await supabase
      .from('riwayat_belajar')
      .insert({
        id_pengguna: user.id,
        id_konten: idMateri,
        tipe_konten: 'materi',
        xp_didapat: 10,
      });

    if (error) return { success: false, error: error.message };
    return { success: true, xpGained: 10, data: result };
  },

  getMyMateri: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('materi')
      .select('*')
      .eq('id_penulis', user.id)
      .order('tanggal_ungghap', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  getMateriForEdit: async (id) => {
    const { data, error } = await supabase
      .from('materi')
      .select('*')
      .eq('id_materi', id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  createMateri: async (data) => {
    const { data: result, error } = await supabase.from('materi').insert(data);
    if (error) return { success: false, error: error.message };
    return { success: true, data: result };
  },

  updateMateri: async (id, data) => {
    const { data: result, error } = await supabase
      .from('materi')
      .update(data)
      .eq('id_materi', id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: result };
  },

  deleteMateri: async (id) => {
    const { error } = await supabase
      .from('materi')
      .delete()
      .eq('id_materi', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
