import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
