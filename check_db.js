import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
const firebaseConfig = {
  projectId: "gen-lang-client-0536420443",
  appId: "1:726594812022:web:b714592a025ae0b59e8757",
  apiKey: "AIzaSyDPF4W8VwPNDDrq8KUhl82lM3A7wtEgPzs"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-nersmartlogistic-b9ef9a1c-5bac-4f01-b3f3-2fab2721205e");
async function run() {
  const snaps = await getDocs(collection(db, 'districts'));
  console.log("Districts:", snaps.docs.map(d => d.data()));
  process.exit(0);
}
run();
