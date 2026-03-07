import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCMGh7WTfJW60XgcITNhAqfOc4ThIMvT-k",
  authDomain: "projyect-controlmoney.firebaseapp.com",
  projectId: "projyect-controlmoney",
  storageBucket: "projyect-controlmoney.firebasestorage.app",
  messagingSenderId: "441923672949",
  appId: "1:441923672949:android:250a6492ab96225f17913c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };