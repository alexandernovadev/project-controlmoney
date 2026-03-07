import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use dynamic require to avoid TS error - getReactNativePersistence exists at runtime in RN
const authModule = require('firebase/auth');
const getReactNativePersistence = authModule.getReactNativePersistence;

const firebaseConfig = {
  apiKey: "AIzaSyCMGh7WTfJW60XgcITNhAqfOc4ThIMvT-k",
  authDomain: "projyect-controlmoney.firebaseapp.com",
  projectId: "projyect-controlmoney",
  storageBucket: "projyect-controlmoney.firebasestorage.app",
  messagingSenderId: "441923672949",
  appId: "1:441923672949:android:250a6492ab96225f17913c"
};

const app = initializeApp(firebaseConfig);
const auth = getReactNativePersistence
  ? authModule.initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : authModule.getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
