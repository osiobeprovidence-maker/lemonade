import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Use environment variables from Vercel, fallback to local config for development
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0261238438',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:523804729634:web:f8e6ef8052b095c9fb457b',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA2MSr0wOLWk5vZo_aPRjOs9TrqbHzyi1k',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0261238438.firebaseapp.com',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0261238438.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '523804729634',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
