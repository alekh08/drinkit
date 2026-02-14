import { createContext, useContext, useEffect, useState } from 'react';
import { connectSocket, disconnectSocket } from '../utils/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('drinkit_user');
        const token = localStorage.getItem('drinkit_token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            connectSocket(token);
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('drinkit_token', token);
        localStorage.setItem('drinkit_user', JSON.stringify(userData));
        setUser(userData);
        connectSocket(token);
    };

    const logout = () => {
        localStorage.removeItem('drinkit_token');
        localStorage.removeItem('drinkit_user');
        setUser(null);
        disconnectSocket();
    };

    const updateUser = (updatedData) => {
        const updated = { ...user, ...updatedData };
        localStorage.setItem('drinkit_user', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
