import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ─────────────────────────────────────────────────────────────
// SETUP STEPS:
//
// 1. Go to https://console.firebase.google.com
// 2. Create a project (or use existing)
// 3. Project Settings → Your apps → Add app → Web
// 4. Copy the config object below
// 5. In Firebase console:
//    - Authentication → Sign-in method → Enable "Anonymous"
//    - Firestore Database → Create database → Start in test mode
//    - (For production, set Firestore rules to restrict writes)
// ─────────────────────────────────────────────────────────────
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJX7kX6cqBHGafSdq-F0tUPgrOrZ_GSmg",
  authDomain: "cipher-1e39d.firebaseapp.com",
  projectId: "cipher-1e39d",
  storageBucket: "cipher-1e39d.firebasestorage.app",
  messagingSenderId: "291662828571",
  appId: "1:291662828571:web:5b22805e3b4b88105b94be",
  measurementId: "G-P8DS8D4KVH"
};


const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)
export default app
