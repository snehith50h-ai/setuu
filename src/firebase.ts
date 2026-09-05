import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0536420443",
  appId: "1:726594812022:web:b714592a025ae0b59e8757",
  apiKey: "AIzaSyDPF4W8VwPNDDrq8KUhl82lM3A7wtEgPzs",
  authDomain: "gen-lang-client-0536420443.firebaseapp.com",
  storageBucket: "gen-lang-client-0536420443.firebasestorage.app",
  messagingSenderId: "726594812022"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence for low-network areas
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, "ai-studio-nersmartlogistic-b9ef9a1c-5bac-4f01-b3f3-2fab2721205e");
