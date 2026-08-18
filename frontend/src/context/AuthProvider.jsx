import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { authService } from '../api/authService';

function loadUserFromStorage() {
    try {
        const saved = localStorage.getItem('user_data');
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to parse user data:', e);
        localStorage.removeItem('user_data');
    }
    return null;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(loadUserFromStorage);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user_data', JSON.stringify({
                id: user.id,
                namaLengkap: user.namaLengkap,
                email: user.email,
                role: user.role,
                statusAktif: user.statusAktif,
                xpLearner: user.xpLearner,
                xpCreator: user.xpCreator,
                rankPeringkat: user.rankPeringkat,
            }));
        }
    }, [user]);

    const handleLogin = useCallback(async (email, password) => {
        const res = await authService.login(email, password);
        if (res.success && res.token) {
            const userData = { ...res.user, token: res.token };
            localStorage.setItem('jwt_token', res.token);
            localStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);
            return res;
        }
        throw new Error(res.error || 'Login gagal');
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};
