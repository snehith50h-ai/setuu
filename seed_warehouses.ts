import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

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

const warehouses = [
  {
    id: "wh-ghy-01",
    name: "Guwahati Central Cold Chain Hub",
    type: "COLD_STORAGE",
    state: "Assam",
    coordinates: { lat: 26.1433, lng: 91.7898 },
    capacityTons: 1500,
    currentOccupancyPercent: 82,
    contactPerson: "Rajesh Kumar (Facility Director)",
    contactNumber: "+91 94350-11223",
    operatingHours: "24/7",
    status: "OPERATIONAL",
    associatedCorridorId: "corridor-nh27"
  },
  {
    id: "wh-sil-02",
    name: "Siliguri Transit Logistics Park",
    type: "MULTI_MODAL_HUB",
    state: "Assam", // Close to Bengal but routing hub for NER
    coordinates: { lat: 26.7269, lng: 88.3953 },
    capacityTons: 5000,
    currentOccupancyPercent: 65,
    contactPerson: "Amitabh Sen (Logistics Officer)",
    contactNumber: "+91 98320-44556",
    operatingHours: "24/7",
    status: "OPERATIONAL",
    associatedCorridorId: "corridor-nh10"
  },
  {
    id: "wh-gtk-03",
    name: "Gangtok High-Altitude Depot",
    type: "STANDARD_WAREHOUSE",
    state: "Sikkim",
    coordinates: { lat: 27.3389, lng: 88.6065 },
    capacityTons: 800,
    currentOccupancyPercent: 92,
    contactPerson: "Dawa Bhutia (Supply Chain Mgr)",
    contactNumber: "+91 97332-99887",
    operatingHours: "06:00 AM - 08:00 PM",
    status: "AT_CAPACITY",
    associatedCorridorId: "corridor-nh10"
  },
  {
    id: "wh-dmp-04",
    name: "Dimapur Supply Base",
    type: "STANDARD_WAREHOUSE",
    state: "Nagaland",
    coordinates: { lat: 25.9060, lng: 93.7275 },
    capacityTons: 1200,
    currentOccupancyPercent: 45,
    contactPerson: "Neiphiu Zhimomi",
    contactNumber: "+91 98560-22334",
    operatingHours: "08:00 AM - 10:00 PM",
    status: "OPERATIONAL",
    associatedCorridorId: "corridor-nh29"
  },
  {
    id: "wh-khm-05",
    name: "Kohima Medical Cold Storage",
    type: "COLD_STORAGE",
    state: "Nagaland",
    coordinates: { lat: 25.6747, lng: 94.1086 },
    capacityTons: 300,
    currentOccupancyPercent: 70,
    contactPerson: "Dr. Ketho Angami",
    contactNumber: "+91 94360-55667",
    operatingHours: "24/7",
    status: "OPERATIONAL",
    associatedCorridorId: "corridor-nh29"
  },
  {
    id: "wh-shl-06",
    name: "Shillong Ridge Distribution Hub",
    type: "MULTI_MODAL_HUB",
    state: "Meghalaya",
    coordinates: { lat: 25.5788, lng: 91.8933 },
    capacityTons: 2500,
    currentOccupancyPercent: 88,
    contactPerson: "Bantei Kharkongor",
    contactNumber: "+91 96150-77889",
    operatingHours: "05:00 AM - 11:00 PM",
    status: "OPERATIONAL",
    associatedCorridorId: "corridor-nh6"
  }
];

async function seed() {
  for (const wh of warehouses) {
    await setDoc(doc(db, "warehouses", wh.id), wh);
    console.log(`Seeded warehouse: ${wh.name}`);
  }
  console.log("Done");
  process.exit(0);
}

seed();
