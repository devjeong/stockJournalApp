import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'KRW');

    function loginWithGoogle() {
        return signInWithPopup(auth, googleProvider);
    }

    function loginAnonymously() {
        return signInAnonymously(auth);
    }

    function logout() {
        return signOut(auth);
    }

    function toggleCurrency() {
        setCurrency(prev => {
            const newCurrency = prev === 'KRW' ? 'USD' : 'KRW';
            localStorage.setItem('currency', newCurrency);
            return newCurrency;
        });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        currency,
        loginWithGoogle,
        loginAnonymously,
        logout,
        toggleCurrency
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
