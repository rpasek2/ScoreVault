import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXF2MErsia35nQVcUsb08dFu5o0qJBzS8",
  authDomain: "scorevault-d5b34.firebaseapp.com",
  projectId: "scorevault-d5b34",
  storageBucket: "scorevault-d5b34.firebasestorage.app",
  messagingSenderId: "695514704249",
  appId: "1:695514704249:web:06c018b8f2ae4e5429a7a8",
  measurementId: "G-D5ZYHKWN06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
