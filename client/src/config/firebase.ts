import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgU6Koq65upUbenVBWQLauvQYq4H_esvM",
  authDomain: "stark-4e72a.firebaseapp.com",
  projectId: "stark-4e72a",
  storageBucket: "stark-4e72a.firebasestorage.app",
  messagingSenderId: "113183508791",
  appId: "1:113183508791:web:fbf0b9f80c41ae1942f2b2",
  measurementId: "G-VHN25DSR1L"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    } else {
      app = getApps()[0];
      console.log('Firebase already initialized');
    }
    auth = getAuth(app);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
}

export { app, auth };
export default firebaseConfig;
