import { supabase } from '../lib/supabase';

export const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    const session = data.session;

    const { data: roleData } = await supabase
      .from('akun')
      .select('role')
      .eq('id_akun', session.user.id)
      .single();

    const { data: userData } = await supabase
      .from('pengguna')
      .select('xpLearner, xpCreator, totalXP, rankPeringkat')
      .eq('id_akun', session.user.id)
      .single();

    return {
      success: true,
      token: session.access_token,
      user: {
        id: session.user.id,
        email: session.user.email,
        namaLengkap: session.user.user_metadata?.full_name || session.user.email,
        role: roleData?.role || 'user',
        xpLearner: userData?.xpLearner || 0,
        xpCreator: userData?.xpCreator || 0,
        totalXP: userData?.totalXP || 0,
        rankPeringkat: userData?.rankPeringkat || 'Unranked',
      },
    };
  },

  register: async (namaLengkap, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: namaLengkap } },
    });
    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  },

  googleLogin: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/dashboard`,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true, url: data.url };
  },
};
