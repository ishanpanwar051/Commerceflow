import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase is configured (all required fields present)
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-api-key' &&
  firebaseConfig.projectId && firebaseConfig.projectId !== 'your-project-id';

let app: ReturnType<typeof initializeApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch {
    // Firebase initialization failed, auth will remain undefined
  }
}

export { auth, googleProvider, isFirebaseConfigured };
