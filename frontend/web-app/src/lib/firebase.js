// Firebase configuration for EvolveYou Web
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase config from evolveyou-prod project
const firebaseConfig = {
  apiKey: "AIzaSyBOoZb7dUNydKUf6I0h1aFJ629uK6ZbdAM",
  authDomain: "evolveyou-prod.firebaseapp.com",
  projectId: "evolveyou-prod",
  storageBucket: "evolveyou-prod.firebasestorage.app",
  messagingSenderId: "278319877545",
  appId: "1:278319877545:web:bba1fb31-26f8-4a73-956a-6d68d1ff3534",
  measurementId: "G-XXXXXXXXXX" // Will be configured when Analytics is set up
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production)
let analytics = null;
if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
  analytics = getAnalytics(app);
}
export { analytics };

// Connect to emulators in development
if (import.meta.env.DEV) {
  // Only connect if not already connected
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (error) {
    // Emulator already connected or not available
  }
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator already connected or not available
  }
  
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Emulator already connected or not available
  }
}

export default app;

