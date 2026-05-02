import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restaurer la session depuis le localStorage
        const stored = localStorage.getItem('geodis_user');
        const token = localStorage.getItem('geodis_token');
        if (stored && token) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                localStorage.removeItem('geodis_user');
                localStorage.removeItem('geodis_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const resp = await api.post('/api/login', { email, password });
        const { token, user: userData } = resp.data;
        localStorage.setItem('geodis_token', token);
        localStorage.setItem('geodis_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('geodis_token');
        localStorage.removeItem('geodis_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
    return ctx;
}
