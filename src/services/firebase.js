import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBVYYR82Q0df66Sr2PYc6kD7_TooeVCXK8",
    authDomain: "stockjournalapp-prod.firebaseapp.com",
    projectId: "stockjournalapp-prod",
    storageBucket: "stockjournalapp-prod.firebasestorage.app",
    messagingSenderId: "32734941456",
    appId: "1:32734941456:web:b96a32a0a0d33d93311595"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
