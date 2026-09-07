import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGkxZts87v_TQclAQxRKr0NH0apo9zGV0",
  authDomain: "fortflux-edf82.firebaseapp.com",
  projectId: "fortflux-edf82",
  storageBucket: "fortflux-edf82.firebasestorage.app",
  messagingSenderId: "82432557665",
  appId: "1:82432557665:web:a38db2fb73baf21adbe020",
  measurementId: "G-EN7P7M80MV",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
