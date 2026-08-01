import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBzySXDWLn1yfF1ONz0I4PtWJE_dF6Aki4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'commerceflow-7cfd1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'commerceflow-7cfd1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'commerceflow-7cfd1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '786242663262',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:786242663262:web:f4e8e3c2a6d66829f955cf',
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
