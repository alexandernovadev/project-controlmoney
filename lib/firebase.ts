import { initializeApp } from 'firebase/app';
// Importa los servicios que necesites:
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// Configuración desde tu google-services.json (proyecto: projyect-controlmoney)
const firebaseConfig = {
  apiKey: 'AIzaSyCMGh7WTfJW60XgcITNhAqfOc4ThIMvT-k',
  authDomain: 'projyect-controlmoney.firebaseapp.com',
  projectId: 'projyect-controlmoney',
  storageBucket: 'projyect-controlmoney.firebasestorage.app',
  messagingSenderId: '441923672949',
  appId: '1:441923672949:android:250a6492ab96225f17913c',
};

const app = initializeApp(firebaseConfig);

// Exporta la app y los servicios cuando los uses:
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

export default app;
