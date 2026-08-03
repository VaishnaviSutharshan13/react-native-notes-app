import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAFjiKV2Y4D0k8mVZe08h1jDpBP95M9Itw",
  authDomain: "react-native-notes-app-7deae.firebaseapp.com",
  projectId: "react-native-notes-app-7deae",
  storageBucket: "react-native-notes-app-7deae.firebasestorage.app",
  messagingSenderId: "49409307204",
  appId: "1:49409307204:web:cdebc9afecc0d0f6850211",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
