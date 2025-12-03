import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInAnonymously,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState('KRW'); // 'KRW' or 'USD'

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const toggleCurrency = () => {
        setCurrency(prev => prev === 'KRW' ? 'USD' : 'KRW');
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google Login Error:", error);
            // Fallback to anonymous for demo if config is missing
            if (error.code === 'auth/configuration-not-found' || error.code === 'auth/api-key-not-valid') {
                alert("Firebase Config missing. Logging in anonymously for demo.");
                await signInAnonymously(auth);
            } else {
                throw error;
            }
        }
    };

    const loginAnonymously = async () => {
        return signInAnonymously(auth);
    };

    const logout = async () => {
        return firebaseSignOut(auth);
    };

    const value = {
        user,
        currency,
        toggleCurrency,
        loginWithGoogle,
        loginAnonymously,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
