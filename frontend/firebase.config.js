
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBPKwfiHfAYZqYGkOsgQy4oj-a_kGcyLIE",
  authDomain: "ai-resume-reviewer-a56f5.firebaseapp.com",
  projectId: "ai-resume-reviewer-a56f5",
  storageBucket: "ai-resume-reviewer-a56f5.firebasestorage.app",
  messagingSenderId: "156748361686",
  appId: "1:156748361686:web:0d70960ffeb48de85efe77",
  measurementId: "G-7R5KZCGPR8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth()
auth.languageCode = 'en';

const provider = new GoogleAuthProvider()
export {
    app,
    auth,
    provider,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
}