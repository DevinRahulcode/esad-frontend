import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Import auth and persistence for React Native
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAuq5eTlOOnA5noIEiNmvwS55ANjfgnIwE",
    authDomain: "hr-app-4f41f.firebaseapp.com",
    projectId: "hr-app-4f41f",
    storageBucket: "hr-app-4f41f.firebasestorage.app",
    messagingSenderId: "1010889436643",
    appId: "1:1010889436643:web:235726692ddc89fc34c4d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});