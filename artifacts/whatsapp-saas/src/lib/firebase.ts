// ============================================================
// Firebase Configuration
// ============================================================
// Reemplaza los valores de abajo con los de tu proyecto Firebase.
// Los encontraras en: Firebase Console → Tu proyecto → Configuracion → SDK
//
// IMPORTANTE: estos valores son publicos (no son secretos) pero
// no los subas al repositorio si el proyecto es privado.
// Usa variables de entorno de Vite (VITE_FIREBASE_*) en produccion.
// ============================================================

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Lee config desde variables de entorno de Vite
// Crea un archivo .env.local en artifacts/whatsapp-saas/ con:
//
//   VITE_FIREBASE_API_KEY=...
//   VITE_FIREBASE_AUTH_DOMAIN=...
//   VITE_FIREBASE_PROJECT_ID=...
//   VITE_FIREBASE_STORAGE_BUCKET=...
//   VITE_FIREBASE_MESSAGING_SENDER_ID=...
//   VITE_FIREBASE_APP_ID=...

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] as string,
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] as string,
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string,
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] as string,
  messagingSenderId: import.meta.env[
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
  ] as string,
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] as string,
  measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] as string,
};

// Inicializar Firebase solo una vez (evitar reinicializacion en hot-reload)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Helpers de autenticacion
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const firebaseSignOut = () => signOut(auth);
export const onFirebaseAuthStateChanged = (
  callback: (user: User | null) => void
) => onAuthStateChanged(auth, callback);

export type { User };
export default app;
