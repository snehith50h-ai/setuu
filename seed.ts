import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import {
  INITIAL_CORRIDORS,
  INITIAL_VEHICLES,
  STRATEGIC_BRIDGES_TUNNELS,
  DISTRICT_CONNECTIVITY_DATA,
  INITIAL_ALERTS,
  INITIAL_FIELD_REPORTS
} from "./src/data/nerData";

const firebaseConfig = {
  projectId: "gen-lang-client-0536420443",
  appId: "1:726594812022:web:b714592a025ae0b59e8757",
  apiKey: "AIzaSyDPF4W8VwPNDDrq8KUhl82lM3A7wtEgPzs",
  authDomain: "gen-lang-client-0536420443.firebaseapp.com",
  storageBucket: "gen-lang-client-0536420443.firebasestorage.app",
  messagingSenderId: "726594812022"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-nersmartlogistic-b9ef9a1c-5bac-4f01-b3f3-2fab2721205e");

async function seed() {
  console.log("Seeding started...");
  
  const checkCol = await getDocs(collection(db, "corridors"));
  if (!checkCol.empty) {
    console.log("Already seeded");
    process.exit(0);
  }

  const batch = writeBatch(db);

  INITIAL_CORRIDORS.forEach(item => {
    const ref = doc(collection(db, "corridors"));
    batch.set(ref, item);
  });

  INITIAL_VEHICLES.forEach(item => {
    const ref = doc(collection(db, "vehicles"));
    batch.set(ref, item);
  });

  STRATEGIC_BRIDGES_TUNNELS.forEach(item => {
    const ref = doc(collection(db, "bridges"));
    batch.set(ref, item);
  });

  DISTRICT_CONNECTIVITY_DATA.forEach(item => {
    const ref = doc(collection(db, "districts"));
    batch.set(ref, item);
  });

  INITIAL_ALERTS.forEach(item => {
    const ref = doc(collection(db, "alerts"));
    batch.set(ref, item);
  });

  INITIAL_FIELD_REPORTS.forEach(item => {
    const ref = doc(collection(db, "incidents"));
    batch.set(ref, item);
  });

  await batch.commit();
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
