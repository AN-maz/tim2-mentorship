import { supabase } from '../lib/supabase';

export const kuisService = {
  getKuisInfo: async (id) => {
    const { data, error } = await supabase
      .from('kuis')
      .select('*')
      .eq('id_kuis', id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  getKuisSoal: async (id) => {
    const { data, error } = await supabase
      .from('soal')
      .select('id_soal, id_kuis, pertanyaan_markdown, opsi_a, opsi_b, opsi_c, opsi_d, urutan')
      .eq('id_kuis', id)
      .order('urutan');

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  submitKuis: async (id, jawaban) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: soalData, error: soalError } = await supabase
      .from('soal')
      .select('id_soal, jawaban_benar')
      .eq('id_kuis', id);

    if (soalError) return { success: false, error: soalError.message };

    let benar = 0;
    const detailJawaban = soalData.map(soal => {
      const jawabanUser = jawaban.find(j => j.id_soal === soal.id_soal);
      const isCorrect = jawabanUser?.jawaban_dipilih === soal.jawaban_benar;
      if (isCorrect) benar++;
      return { idSoal: soal.id_soal, benar: isCorrect };
    });

    const total = soalData.length;
    const skor = Math.round((benar / total) * 100);

    const { data: { data: kuisData } = {} } = await supabase
      .from('kuis')
      .select('poin_xp_default')
      .eq('id_kuis', id)
      .single();

    const kuisDefault = kuisData?.poin_xp_default || 10;
    const bonusPerBenar = 5;
    const xpGained = Math.round((skor / 100) * kuisDefault) + (benar * bonusPerBenar);

    const { data: result, error } = await supabase
      .from('riwayat_belajar')
      .insert({
        id_pengguna: user.id,
        id_kuis: id,
        id_konten: id,
        tipe_konten: 'kuis',
        xp_didapat: xpGained,
        skor: skor,
      });

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      skor,
      benar,
      total,
      xpGained,
      detailJawaban,
      data: result,
    };
  },

  getMyKuis: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('kuis')
      .select('*')
      .eq('id_creator', user.id)
      .order('tanggal_buat', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  getKuisForEdit: async (id) => {
    const { data: kuis, error: kuisError } = await supabase
      .from('kuis')
      .select('*')
      .eq('id_kuis', id)
      .single();

    if (kuisError) return { success: false, error: kuisError.message };

    const { data: soal, error: soalError } = await supabase
      .from('soal')
      .select('*')
      .eq('id_kuis', id)
      .order('urutan');

    if (soalError) return { success: false, error: soalError.message };

    return { success: true, data: { ...kuis, soal: soal || [] } };
  },

  createKuis: async (payload) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { soal, ...kuisData } = payload;

    const { data: kuisResult, error: kuisError } = await supabase
      .from('kuis')
      .insert({
        ...kuisData,
        id_creator: user.id,
        nama_creator: user.user_metadata?.full_name || user.email,
        jumlah_soal: soal.length,
      })
      .select('id_kuis')
      .single();

    if (kuisError) return { success: false, error: kuisError.message };

    const kuisId = kuisResult.id_kuis;
    const soalWithKuis = soal.map((s, index) => ({
      ...s,
      id_kuis: kuisId,
      urutan: index + 1,
    }));

    const { data: soalResult, error: soalError } = await supabase
      .from('soal')
      .insert(soalWithKuis);

    if (soalError) return { success: false, error: soalError.message };

    return { success: true, kuisId, data: soalResult };
  },
};
