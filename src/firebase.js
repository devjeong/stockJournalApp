import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBVYYR82Q0df66Sr2PYc6kD7_TooeVCXK8",
    authDomain: "stockjournalapp-prod.web.app",
    projectId: "stockjournalapp-prod",
    storageBucket: "stockjournalapp-prod.firebasestorage.app",
    messagingSenderId: "32734941456",
    appId: "1:32734941456:web:b96a32a0a0d33d93311595"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
