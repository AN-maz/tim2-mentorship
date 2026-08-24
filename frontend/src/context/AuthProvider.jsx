import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { supabase } from '../lib/supabase';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setLoading(false);

            if (session) {
                const { data: userData, error } = await supabase
                    .from('pengguna')
                    .select('xp_learner, xp_creator, total_xp, rank_peringkat')
                    .eq('id_akun', session.user.id)
                    .single();

                const akun = {
                    id: session.user.id,
                    email: session.user.email,
                    namaLengkap: session.user.user_metadata?.full_name || session.user.email,
                    photoURL: session.user.user_metadata?.avatar_url,
                };

                if (!error && userData) {
                    akun.xpLearner = userData.xp_learner;
                    akun.xpCreator = userData.xp_creator;
                    akun.totalXP = userData.total_xp;
                    akun.rankPeringkat = userData.rank_peringkat;
                }

                setUser(akun);
            }
        };

        getSession();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    const { data: userData, error } = await supabase
                        .from('pengguna')
                        .select('xp_learner, xp_creator, total_xp, rank_peringkat')
                        .eq('id_akun', session.user.id)
                        .single();

                    const akun = {
                        id: session.user.id,
                        email: session.user.email,
                        namaLengkap: session.user.user_metadata?.full_name || session.user.email,
                        photoURL: session.user.user_metadata?.avatar_url,
                    };

                    if (!error && userData) {
                        akun.xpLearner = userData.xp_learner;
                        akun.xpCreator = userData.xp_creator;
                        akun.totalXP = userData.total_xp;
                        akun.rankPeringkat = userData.rank_peringkat;
                    }

                    setUser(akun);
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw new Error(error.message);

        const session = data.session;

        const { data: userData } = await supabase
            .from('pengguna')
            .select('xp_learner, xp_creator, total_xp, rank_peringkat')
            .eq('id_akun', session.user.id)
            .single();

        const roleData = await supabase
            .from('akun')
            .select('role')
            .eq('id_akun', session.user.id)
            .single();

        const userPayload = {
            id: session.user.id,
            email: session.user.email,
            namaLengkap: session.user.user_metadata?.full_name || session.user.email,
            role: roleData.data?.role || 'user',
            xpLearner: userData?.xp_learner || 0,
            xpCreator: userData?.xp_creator || 0,
            totalXP: userData?.total_xp || 0,
            rankPeringkat: userData?.rank_peringkat || 'Unranked',
        };

        setUser(userPayload);
        return { success: true, user: userPayload };
    }, []);

    const handleRegister = useCallback(async (namaLengkap, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: namaLengkap,
                },
            },
        });

        if (error) throw new Error(error.message);
        return { success: true, user: data.user };
    }, []);

    const handleGoogleLogin = useCallback(async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/auth`,
            },
        });
        if (error) throw new Error(error.message);
        return { success: true, url: data.url };
    }, []);

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            login: handleLogin,
            register: handleRegister,
            googleLogin: handleGoogleLogin,
            logout: handleLogout,
            loading,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};