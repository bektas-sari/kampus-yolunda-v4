'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: boolean;
    isLoading: boolean;
    login: (access: string, refresh: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: false,
    isLoading: true,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = () => {
            const access = localStorage.getItem('access');
            if (access) {
                console.log('AuthContext: Token found, setting user to true');
                setUser(true);
            } else {
                console.log('AuthContext: No token found');
                setUser(false);
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const login = (access: string, refresh: string) => {
        console.log('AuthContext: Login called');
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        setUser(true);
        router.push('/');
    };

    const logout = () => {
        console.log('AuthContext: Logout called');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
