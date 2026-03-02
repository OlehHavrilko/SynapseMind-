import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "synapsemind-f6868.firebaseapp.com",
  projectId: "synapsemind-f6868",
  storageBucket: "synapsemind-f6868.firebasestorage.app",
  messagingSenderId: "334725399195",
  appId: "1:334725399195:web:3e6e1a899d1ec400e17c3e",
  measurementId: "G-15J4RWJCP6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export default app;
