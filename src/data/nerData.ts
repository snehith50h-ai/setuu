import { HighwayCorridor, StrategicBridgeOrTunnel, TrackedVehicle, DistrictConnectivity, SystemAlert, FieldIncidentReport } from "../types";

export const INITIAL_CORRIDORS: HighwayCorridor[] = [
  {
    id: "corridor-nh10",
    name: "NH-10 Siliguri - Sevoke - Teesta - Gangtok Lifeline",
    code: "NH-10",
    state: "Sikkim",
    connectingDistricts: ["Darjeeling (Border)", "Pakyong", "East Sikkim", "Gangtok"],
    startPoint: "Siliguri Junction (0 km)",
    endPoint: "Gangtok Transit Depot (114 km)",
    elevationProfile: "120m to 1,650m ASL (Steep Teesta Gorge)",
    status: "BLOCKED",
    centerCoordinates: { lat: 27.0512, lng: 88.4721 },
    coordinatesPath: [
      { lat: 26.7271, lng: 88.3953 }, // Siliguri
      { lat: 26.8923, lng: 88.4682 }, // Sevoke
      { lat: 27.0512, lng: 88.4721 }, // Teesta Bazar
      { lat: 27.1432, lng: 88.5123 }, // Melli
      { lat: 27.2341, lng: 88.5012 }, // Singtam
      { lat: 27.3389, lng: 88.6065 }, // Gangtok
    ],
    currentDisruption: {
      cause: "Landslide",
      description: "Severe 120m hill slide with shooting stones and Teesta river undercutting near 29th Mile / Birik Dara.",
      mileageMarker: "KM 46.8 (Birik Dara)",
      reportedTime: "2 hours ago",
      estimatedClearance: "14 - 18 hours (Heavy excavator in action)",
    },
    environmentalMetrics: {
      rainfall24h: 142,
      rainfall72h: 310,
      soilSaturation: 94,
      slopeInclineDegrees: 48,
      hazardIndex: 92,
    },
    alternateRouteSummary: "Divert light cargo via Lava - Algarah - Reshi - Pedong - Rorathang. Heavy trucks held at Sevoke staging yard.",
  },
  {
    id: "corridor-nh27",
    name: "NH-27 East-West Corridor (Lumding - Haflong - Silchar)",
    code: "NH-27",
    state: "Assam",
    connectingDistricts: ["Nagaon", "Hojai", "Dima Hasao", "Cachar (Silchar)"],
    startPoint: "Lumding Bypass (0 km)",
    endPoint: "Silchar ISBT Terminal (198 km)",
    elevationProfile: "80m to 680m ASL (Barail Mountain Range)",
    status: "RESTRICTED",
    centerCoordinates: { lat: 25.1762, lng: 93.0234 },
    coordinatesPath: [
      { lat: 25.7512, lng: 93.1721 }, // Lumding
      { lat: 25.4215, lng: 93.1042 }, // Maibang
      { lat: 25.1762, lng: 93.0234 }, // Haflong / Jatinga
      { lat: 24.9612, lng: 92.8945 }, // Harangajao
      { lat: 24.8333, lng: 92.7789 }, // Silchar
    ],
    currentDisruption: {
      cause: "Road Subsidence",
      description: "Carriageway sinking 1.4m near Jatinga Lampu due to subterranean saturation. Single-lane convoy pilot active.",
      mileageMarker: "KM 112 (Jatinga Ridge)",
      reportedTime: "5 hours ago",
      estimatedClearance: "Single-lane operational; full repair 36 hrs",
    },
    environmentalMetrics: {
      rainfall24h: 88,
      rainfall72h: 220,
      soilSaturation: 84,
      slopeInclineDegrees: 34,
      hazardIndex: 78,
    },
    alternateRouteSummary: "Heavy petroleum tankers diverted via Shillong - Jowai - Ratacherra (NH-6).",
  },
  {
    id: "corridor-nh29",
    name: "NH-29 Dimapur - Kohima - Mao Gate Lifeline",
    code: "NH-29",
    state: "Nagaland",
    connectingDistricts: ["Dimapur", "Chümoukedima", "Kohima", "Senapati (Manipur Border)"],
    startPoint: "Dimapur Railway Freight Yard (0 km)",
    endPoint: "Mao Gate Transit Post (92 km)",
    elevationProfile: "145m to 1,444m ASL (Naga Hills Ascent)",
    status: "HIGH_RISK",
    centerCoordinates: { lat: 25.7214, lng: 93.9842 },
    coordinatesPath: [
      { lat: 25.9065, lng: 93.7274 }, // Dimapur
      { lat: 25.7981, lng: 93.8123 }, // Chümoukedima / Pagla Pahar
      { lat: 25.7214, lng: 93.9842 }, // Medziphema
      { lat: 25.6747, lng: 94.1086 }, // Kohima
      { lat: 25.5123, lng: 94.1456 }, // Mao Gate
    ],
    environmentalMetrics: {
      rainfall24h: 76,
      rainfall72h: 185,
      soilSaturation: 81,
      slopeInclineDegrees: 42,
      hazardIndex: 74,
    },
    alternateRouteSummary: "BRO Project Sewak pilot escort active. Night movement suspended from 20:00 to 05:00 hrs.",
  },
  {
    id: "corridor-nh13",
    name: "NH-13 Trans-Arunachal Highway (Potin - Ziro - Daporijo - Pasighat)",
    code: "NH-13",
    state: "Arunachal Pradesh",
    connectingDistricts: ["Papum Pare", "Lower Subansiri", "Upper Subansiri", "East Siang"],
    startPoint: "Potin Junction (0 km)",
    endPoint: "Pasighat Logistics Hub (360 km)",
    elevationProfile: "300m to 2,400m ASL (Eastern Himalaya Slopes)",
    status: "RESTRICTED",
    centerCoordinates: { lat: 27.6521, lng: 93.8214 },
    coordinatesPath: [
      { lat: 27.2812, lng: 93.7145 }, // Potin
      { lat: 27.5942, lng: 93.8341 }, // Ziro
      { lat: 27.9865, lng: 94.2214 }, // Daporijo
      { lat: 28.1742, lng: 94.7812 }, // Along (Aalo)
      { lat: 28.0664, lng: 95.3265 }, // Pasighat
    ],
    currentDisruption: {
      cause: "Mudflow",
      description: "Subansiri basin slush deposition covering 70m of highway between Mengio and Ziro.",
      mileageMarker: "KM 78.4",
      reportedTime: "1 hour ago",
      estimatedClearance: "4 hours (Dozer currently pushing mud)",
    },
    environmentalMetrics: {
      rainfall24h: 95,
      rainfall72h: 245,
      soilSaturation: 87,
      slopeInclineDegrees: 39,
      hazardIndex: 79,
    },
    alternateRouteSummary: "Local PWD detour via Yazali old alignment passable for 4x4 pickup trucks.",
  },
  {
    id: "corridor-nh6",
    name: "NH-6 Guwahati - Shillong - Jowai - Ratacherra Expressway",
    code: "NH-6",
    state: "Meghalaya",
    connectingDistricts: ["Ri-Bhoi", "East Khasi Hills", "West Jaintia Hills", "East Jaintia Hills"],
    startPoint: "Khanapara Gateway (0 km)",
    endPoint: "Ratacherra Assam Border (218 km)",
    elevationProfile: "55m to 1,520m ASL (Meghalaya Cloud Plateau)",
    status: "OPEN",
    centerCoordinates: { lat: 25.5788, lng: 91.8933 },
    coordinatesPath: [
      { lat: 26.1124, lng: 91.8142 }, // Khanapara
      { lat: 25.9012, lng: 91.8745 }, // Nongpoh
      { lat: 25.5788, lng: 91.8933 }, // Shillong
      { lat: 25.5124, lng: 92.0512 }, // Mawryngkneng
      { lat: 25.4412, lng: 92.2045 }, // Jowai
      { lat: 25.2145, lng: 92.4812 }, // Khliehriat
      { lat: 25.1764, lng: 92.3789 }, // Lumshnong
      { lat: 25.1123, lng: 92.3614 }, // Sonapur Tunnel
      { lat: 25.0682, lng: 92.3856 }, // Umkiang
      { lat: 25.0215, lng: 92.4312 }, // Malidor
      { lat: 24.9812, lng: 92.5123 }, // Ratacherra
      { lat: 24.9012, lng: 92.5934 }, // Badarpur
      { lat: 24.8333, lng: 92.7789 }, // Silchar
    ],
    environmentalMetrics: {
      rainfall24h: 52,
      rainfall72h: 130,
      soilSaturation: 68,
      slopeInclineDegrees: 28,
      hazardIndex: 42,
    },
    alternateRouteSummary: "Route all clear. High fog warning between Umiam Lake and Mawryngkneng.",
  },
  {
    id: "corridor-nh102",
    name: "NH-102 Imphal - Thoubal - Pallel - Moreh Border Highway",
    code: "NH-102",
    state: "Manipur",
    connectingDistricts: ["Imphal East", "Thoubal", "Kakching", "Tengnoupal"],
    startPoint: "Imphal Regional Depot (0 km)",
    endPoint: "Moreh Integrated Check Post (107 km)",
    elevationProfile: "780m to 1,320m to 150m ASL (Manipur Valley to Chindwin border)",
    status: "OPEN",
    centerCoordinates: { lat: 24.5123, lng: 94.0214 },
    coordinatesPath: [
      { lat: 24.8170, lng: 93.9368 }, // Imphal
      { lat: 24.6341, lng: 93.9987 }, // Thoubal
      { lat: 24.4712, lng: 94.0541 }, // Pallel
      { lat: 24.3812, lng: 94.1542 }, // Tengnoupal
      { lat: 24.2489, lng: 94.3056 }, // Moreh
    ],
    environmentalMetrics: {
      rainfall24h: 38,
      rainfall72h: 90,
      soilSaturation: 54,
      slopeInclineDegrees: 31,
      hazardIndex: 38,
    },
  },
  {
    id: "corridor-nh306",
    name: "NH-306 / NH-54 Silchar - Vairengte - Kolasib - Aizawl Lifeline",
    code: "NH-306",
    state: "Mizoram",
    connectingDistricts: ["Cachar (Border)", "Kolasib", "Aizawl"],
    startPoint: "Silchar Toll Plaza (0 km)",
    endPoint: "Aizawl Tuikual Central Depot (178 km)",
    elevationProfile: "40m to 1,130m ASL (Lushai Hill Ridges)",
    status: "HIGH_RISK",
    centerCoordinates: { lat: 24.1245, lng: 92.7412 },
    coordinatesPath: [
      { lat: 24.7812, lng: 92.7612 }, // Silchar South
      { lat: 24.5123, lng: 92.7541 }, // Vairengte
      { lat: 24.2214, lng: 92.6841 }, // Kolasib
      { lat: 23.9512, lng: 92.7123 }, // Durtlang
      { lat: 23.7271, lng: 92.7176 }, // Aizawl
    ],
    environmentalMetrics: {
      rainfall24h: 79,
      rainfall72h: 195,
      soilSaturation: 82,
      slopeInclineDegrees: 44,
      hazardIndex: 76,
    },
    alternateRouteSummary: "Heavy freight restricted to 16-ton gross vehicle weight across Tuirial culverts.",
  },
  {
    id: "corridor-nh8",
    name: "NH-8 Assam Border - Churaibari - Teliamura - Agartala Expressway",
    code: "NH-8",
    state: "Tripura",
    connectingDistricts: ["North Tripura", "Unakoti", "Dhalai", "Khowai", "West Tripura"],
    startPoint: "Churaibari Commercial Tax Gate (0 km)",
    endPoint: "Agartala Integrated Logistics Park (196 km)",
    elevationProfile: "30m to 350m ASL (Rolling Baramura/Atharamura Hills)",
    status: "OPEN",
    centerCoordinates: { lat: 23.9812, lng: 91.8412 },
    coordinatesPath: [
      { lat: 24.5123, lng: 92.2412 }, // Churaibari
      { lat: 24.2812, lng: 92.0145 }, // Kumarghat
      { lat: 23.9812, lng: 91.8412 }, // Ambassa
      { lat: 23.8341, lng: 91.5912 }, // Teliamura
      { lat: 23.8315, lng: 91.2868 }, // Agartala
    ],
    environmentalMetrics: {
      rainfall24h: 42,
      rainfall72h: 110,
      soilSaturation: 61,
      slopeInclineDegrees: 22,
      hazardIndex: 32,
    },
  },
];

export const STRATEGIC_BRIDGES_TUNNELS: StrategicBridgeOrTunnel[] = [
  {
    id: "asset-sela-tunnel",
    name: "Sela Tunnel (Twin Tube, 13,000+ ft)",
    type: "TUNNEL",
    state: "Arunachal Pradesh",
    coordinates: { lat: 27.5021, lng: 92.1042 },
    elevationMeters: 4020,
    maxWeightTons: 70,
    status: "OPEN",
    strategicImportance: "All-weather lifeline connecting Tezpur/Dirang to Tawang border district, bypassing heavy snow on Sela Pass.",
    details: "Automated ventilation, SCADA fire safety, and BRO winter snowplow unit stationed at West Portal.",
  },
  {
    id: "asset-bogibeel-bridge",
    name: "Bogibeel Rail-cum-Road Bridge (4.94 km)",
    type: "BRIDGE",
    state: "Assam",
    coordinates: { lat: 27.4012, lng: 94.7541 },
    elevationMeters: 105,
    maxWeightTons: 60,
    status: "OPEN",
    strategicImportance: "Brahmaputra mega-crossing linking Dibrugarh and Dhemaji, key for strategic cargo to Eastern Arunachal.",
    details: "Structural health monitoring sensors active; wind speed 22 km/h (within safe 65 km/h tolerance).",
  },
  {
    id: "asset-dhola-sadiya",
    name: "Bhupen Hazarika Setu (Dhola-Sadiya Bridge, 9.15 km)",
    type: "BRIDGE",
    state: "Assam",
    coordinates: { lat: 27.7965, lng: 95.6612 },
    elevationMeters: 135,
    maxWeightTons: 60,
    status: "OPEN",
    strategicImportance: "Spanning the Lohit River, connects Eastern Assam with Roing and Anini (Dibang Valley).",
    details: "Operated by MoRTH/BRO; military tank class 60 certified.",
  },
  {
    id: "asset-coronation-bridge",
    name: "Sevoke Coronation Bridge (Teesta River Gorge)",
    type: "BRIDGE",
    state: "Sikkim",
    coordinates: { lat: 26.9012, lng: 88.4712 },
    elevationMeters: 180,
    maxWeightTons: 12,
    status: "RESTRICTED",
    strategicImportance: "Historical reinforced concrete arch bridge over Teesta gorge connecting Bengal plains to Sikkim/Kalimpong.",
    details: "Strict 10 km/h speed limit. Heavy trucks >12T strictly diverted to Sevoke Railway Bailey bypass.",
  },
  {
    id: "asset-kolodyne-bridge",
    name: "Kolodyne Multi-Span River Bridge",
    type: "BRIDGE",
    state: "Mizoram",
    coordinates: { lat: 22.4812, lng: 92.9512 },
    elevationMeters: 310,
    maxWeightTons: 35,
    status: "OPEN",
    strategicImportance: "Critical artery on Kaladan Multi-Modal Transit Transport Corridor.",
    details: "Water level 4.2m below danger mark.",
  },
  {
    id: "asset-saraighat-bridge",
    name: "Saraighat Dual Rail-Road Bridges",
    type: "BRIDGE",
    state: "Assam",
    coordinates: { lat: 26.1712, lng: 91.6841 },
    elevationMeters: 55,
    maxWeightTons: 60,
    status: "OPEN",
    strategicImportance: "Historic gateway spanning Brahmaputra connecting North & South banks at Guwahati.",
    details: "Both Old and New cantilever spans clear; smooth transit into Guwahati multimodal hub.",
  },
];

export const INITIAL_VEHICLES: TrackedVehicle[] = [
  {
    id: "veh-ner-101",
    registrationNumber: "AS-01-GC-4482",
    driverName: "Biplab Barman",
    contactNumber: "+91 94350-28192",
    cargoType: "MEDICINES_VACCINES",
    cargoDescription: "Insulin vials, anti-venom, baby vaccines & dialysis fluids",
    cargoPriority: "CRITICAL",
    weightTons: 7.5,
    origin: "Guwahati Central Medical Store Depot",
    destination: "STNM Hospital Gangtok, Sikkim",
    currentCorridorId: "corridor-nh10",
    coordinates: { lat: 26.9412, lng: 88.4612 },
    speedKmh: 0,
    altitudeMeters: 240,
    fuelBatteryPercent: 88,
    status: "REROUTED",
    delayMinutes: 195,
    eta: "Today, 19:30 IST",
    temperatureControlled: true,
    tempCelsius: 4.2,
    lastUpdated: "Just now",
    breadcrumbs: [
      { lat: 26.7271, lng: 88.3953 },
      { lat: 26.8512, lng: 88.4312 },
      { lat: 26.9412, lng: 88.4612 },
    ],
  },
  {
    id: "veh-ner-102",
    registrationNumber: "NL-07-A-8910",
    driverName: "Temsüba Ao",
    contactNumber: "+91 98621-55019",
    cargoType: "PDS_FOOD_GRAINS",
    cargoDescription: "FCI Fortified Rice & Wheat Atta for Public Distribution System",
    cargoPriority: "HIGH",
    weightTons: 22.0,
    origin: "Dimapur FCI Rail Siding Depot",
    destination: "Imphal East PDS Granary, Manipur",
    currentCorridorId: "corridor-nh29",
    coordinates: { lat: 25.7512, lng: 93.9412 },
    speedKmh: 32,
    altitudeMeters: 920,
    fuelBatteryPercent: 64,
    status: "ON_TRACK",
    delayMinutes: 35,
    eta: "Today, 17:15 IST",
    lastUpdated: "2 mins ago",
    breadcrumbs: [
      { lat: 25.9065, lng: 93.7274 },
      { lat: 25.8214, lng: 93.8541 },
      { lat: 25.7512, lng: 93.9412 },
    ],
  },
  {
    id: "veh-ner-103",
    registrationNumber: "AR-01-T-3129",
    driverName: "Tenzing Dorjee",
    contactNumber: "+91 89741-20984",
    cargoType: "STRATEGIC_CONSTRUCTION_BRO",
    cargoDescription: "Bailey bridge prefabricated steel girders & culvert reinforcement rods",
    cargoPriority: "CRITICAL",
    weightTons: 28.5,
    origin: "Tezpur BRO Base Camp",
    destination: "Tawang High-Altitude Forward Outpost",
    currentCorridorId: "corridor-nh13",
    coordinates: { lat: 27.3512, lng: 92.4212 },
    speedKmh: 24,
    altitudeMeters: 2890,
    fuelBatteryPercent: 78,
    status: "ON_TRACK",
    delayMinutes: 15,
    eta: "Tomorrow, 11:00 IST",
    lastUpdated: "5 mins ago",
    breadcrumbs: [
      { lat: 26.6512, lng: 92.7912 },
      { lat: 27.1214, lng: 92.5123 },
      { lat: 27.3512, lng: 92.4212 },
    ],
  },
  {
    id: "veh-ner-104",
    registrationNumber: "MZ-01-D-5140",
    driverName: "Lalmuanpuia Ralte",
    contactNumber: "+91 97740-83210",
    cargoType: "POL_FUEL_TANKERS",
    cargoDescription: "Motor Spirit (Petrol) & High Speed Diesel (IOCL Bulk Tanker)",
    cargoPriority: "HIGH",
    weightTons: 18.0,
    origin: "Silchar IOCL Bottling & Oil Terminal",
    destination: "Aizawl POL Underground Storage Bunker",
    currentCorridorId: "corridor-nh306",
    coordinates: { lat: 24.3124, lng: 92.7123 },
    speedKmh: 18,
    altitudeMeters: 620,
    fuelBatteryPercent: 71,
    status: "DELAYED",
    delayMinutes: 80,
    eta: "Today, 21:00 IST",
    lastUpdated: "1 min ago",
    breadcrumbs: [
      { lat: 24.7812, lng: 92.7612 },
      { lat: 24.5123, lng: 92.7541 },
      { lat: 24.3124, lng: 92.7123 },
    ],
  },
  {
    id: "veh-ner-105",
    registrationNumber: "TR-01-B-9021",
    driverName: "Sanjoy Debbarma",
    contactNumber: "+91 94361-44129",
    cargoType: "AGRI_HORTICULTURE",
    cargoDescription: "Queen Pineapple fresh harvest & King Chilli (Bhut Jolokia) for air cargo export",
    cargoPriority: "STANDARD",
    weightTons: 10.2,
    origin: "Teliamura Farmers Producer Org",
    destination: "Guwahati Borjhar Air Cargo Terminal",
    currentCorridorId: "corridor-nh8",
    coordinates: { lat: 24.0812, lng: 91.9512 },
    speedKmh: 45,
    altitudeMeters: 140,
    fuelBatteryPercent: 82,
    status: "ON_TRACK",
    delayMinutes: 0,
    eta: "Tomorrow, 06:30 IST",
    lastUpdated: "3 mins ago",
    breadcrumbs: [
      { lat: 23.8341, lng: 91.5912 },
      { lat: 23.9812, lng: 91.8412 },
      { lat: 24.0812, lng: 91.9512 },
    ],
  },
  {
    id: "veh-ner-106",
    registrationNumber: "MN-01-AA-2015",
    driverName: "Nongthombam Meitei",
    contactNumber: "+91 87941-66723",
    cargoType: "DISASTER_RELIEF",
    cargoDescription: "High-capacity submersible dewatering pumps & water purification sachets",
    cargoPriority: "CRITICAL",
    weightTons: 8.0,
    origin: "Silchar NDRF Battalion Base",
    destination: "Haflong Relief Camp, Dima Hasao",
    currentCorridorId: "corridor-nh27",
    coordinates: { lat: 25.0812, lng: 92.9812 },
    speedKmh: 20,
    altitudeMeters: 510,
    fuelBatteryPercent: 60,
    status: "DELAYED",
    delayMinutes: 110,
    eta: "Today, 18:45 IST",
    lastUpdated: "Just now",
    breadcrumbs: [
      { lat: 24.8333, lng: 92.7789 },
      { lat: 24.9612, lng: 92.8945 },
      { lat: 25.0812, lng: 92.9812 },
    ],
  },
];

export const DISTRICT_CONNECTIVITY_DATA: DistrictConnectivity[] = [
  {
    districtName: "East Sikkim & Gangtok",
    state: "Sikkim",
    connectivityIndex: 38,
    isolationRisk: "CRITICAL",
    activeCutoffsCount: 2,
    essentialStockStatus: {
      medicinesDaysRemaining: 2.5,
      foodGrainsDaysRemaining: 6.0,
      fuelDaysRemaining: 3.5,
    },
    primaryLifeline: "NH-10 via Sevoke - Teesta",
    alternateRescueMode: "BAILEY_BRIDGE",
    coordinates: { lat: 27.3389, lng: 88.6065 },
  },
  {
    districtName: "Dima Hasao (Haflong)",
    state: "Assam",
    connectivityIndex: 52,
    isolationRisk: "HIGH",
    activeCutoffsCount: 1,
    essentialStockStatus: {
      medicinesDaysRemaining: 4.5,
      foodGrainsDaysRemaining: 9.0,
      fuelDaysRemaining: 5.0,
    },
    primaryLifeline: "NH-27 Lumding - Silchar Highway",
    alternateRescueMode: "RIVERINE_FERRY",
    coordinates: { lat: 25.1762, lng: 93.0234 },
  },
  {
    districtName: "Tawang & West Kameng",
    state: "Arunachal Pradesh",
    connectivityIndex: 78,
    isolationRisk: "MODERATE",
    activeCutoffsCount: 0,
    essentialStockStatus: {
      medicinesDaysRemaining: 18.0,
      foodGrainsDaysRemaining: 25.0,
      fuelDaysRemaining: 14.0,
    },
    primaryLifeline: "NH-13 / Sela Twin Tunnel All-Weather Route",
    alternateRescueMode: "AIR_DROP_HELIPAD",
    coordinates: { lat: 27.5861, lng: 91.8653 },
  },
  {
    districtName: "Kohima & Phek",
    state: "Nagaland",
    connectivityIndex: 68,
    isolationRisk: "MODERATE",
    activeCutoffsCount: 1,
    essentialStockStatus: {
      medicinesDaysRemaining: 8.0,
      foodGrainsDaysRemaining: 14.0,
      fuelDaysRemaining: 7.0,
    },
    primaryLifeline: "NH-29 Dimapur - Kohima",
    alternateRescueMode: "4x4_SPECIAL_CONVOY",
    coordinates: { lat: 25.6747, lng: 94.1086 },
  },
  {
    districtName: "Imphal West & East",
    state: "Manipur",
    connectivityIndex: 72,
    isolationRisk: "MODERATE",
    activeCutoffsCount: 1,
    essentialStockStatus: {
      medicinesDaysRemaining: 6.0,
      foodGrainsDaysRemaining: 12.0,
      fuelDaysRemaining: 8.0,
    },
    primaryLifeline: "NH-2 & NH-37 Jiribam - Imphal",
    alternateRescueMode: "AIR_DROP_HELIPAD",
    coordinates: { lat: 24.8170, lng: 93.9368 },
  },
  {
    districtName: "Champhai & Serchhip",
    state: "Mizoram",
    connectivityIndex: 48,
    isolationRisk: "HIGH",
    activeCutoffsCount: 2,
    essentialStockStatus: {
      medicinesDaysRemaining: 3.2,
      foodGrainsDaysRemaining: 7.5,
      fuelDaysRemaining: 4.0,
    },
    primaryLifeline: "NH-306 / NH-6 via Aizawl",
    alternateRescueMode: "4x4_SPECIAL_CONVOY",
    coordinates: { lat: 23.4561, lng: 93.3289 },
  },
  {
    districtName: "Dhalai & North Tripura",
    state: "Tripura",
    connectivityIndex: 88,
    isolationRisk: "LOW",
    activeCutoffsCount: 0,
    essentialStockStatus: {
      medicinesDaysRemaining: 15.0,
      foodGrainsDaysRemaining: 21.0,
      fuelDaysRemaining: 12.0,
    },
    primaryLifeline: "NH-8 Churaibari - Agartala Corridor",
    alternateRescueMode: "BAILEY_BRIDGE",
    coordinates: { lat: 23.9812, lng: 91.8412 },
  },
  {
    districtName: "East & West Khasi Hills (Shillong)",
    state: "Meghalaya",
    connectivityIndex: 92,
    isolationRisk: "LOW",
    activeCutoffsCount: 0,
    essentialStockStatus: {
      medicinesDaysRemaining: 24.0,
      foodGrainsDaysRemaining: 30.0,
      fuelDaysRemaining: 18.0,
    },
    primaryLifeline: "NH-6 Guwahati - Shillong Expressway",
    alternateRescueMode: "4x4_SPECIAL_CONVOY",
    coordinates: { lat: 25.5788, lng: 91.8933 },
  },
];

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: "alert-001",
    corridor: "NH-10 Sevoke - Teesta Section",
    state: "Sikkim",
    severity: "CRITICAL",
    title: "Major Landslide - Both Carriageways Blocked",
    message: "Debris fall at Birik Dara has severed link to Gangtok. 42 freight vehicles queued. Divert all medical/food supplies via Lava-Algarah-Reshi bypass.",
    timestamp: "18 mins ago",
    affectedVehiclesCount: 42,
    alternateAvailable: true,
  },
  {
    id: "alert-002",
    corridor: "NH-27 Lumding - Silchar Hill Section",
    state: "Assam",
    severity: "WARNING",
    title: "Road Subsidence at Jatinga Lampu",
    message: "1.4m pavement slump restricts movement to pilot-guided single lane. Multi-axle tankers exceeding 20T hold at Lumding staging hub.",
    timestamp: "45 mins ago",
    affectedVehiclesCount: 19,
    alternateAvailable: true,
  },
  {
    id: "alert-003",
    corridor: "NH-29 Pagla Pahar Gorge",
    state: "Nagaland",
    severity: "WARNING",
    title: "Rockfall Hazard - Precautionary Convoy Restriction",
    message: "Intermittent boulders dislodging due to 76mm continuous rainfall. BRO Project Sewak clearance team stationed with wheel loader.",
    timestamp: "1 hour ago",
    affectedVehiclesCount: 14,
    alternateAvailable: false,
  },
  {
    id: "alert-004",
    corridor: "NH-306 Vairengte Border Entry",
    state: "Mizoram",
    severity: "ADVISORY",
    title: "Heavy Axle Weight Restriction on Bridge No. 44",
    message: "Bridge load rating capped at 16 tons. PWD Mizoram mobile weighing station operational at Vairengte check-post.",
    timestamp: "3 hours ago",
    affectedVehiclesCount: 8,
    alternateAvailable: true,
  },
];

export const INITIAL_FIELD_REPORTS: FieldIncidentReport[] = [
  {
    id: "rep-001",
    reporterName: "Er. Ramesh Sonowal",
    officialDesignation: "Assistant Executive Engineer",
    department: "BRO",
    contact: "+91 94351-99812",
    incidentType: "Landslide",
    district: "East Sikkim",
    state: "Sikkim",
    corridorName: "NH-10 KM 46.8 (Birik Dara)",
    coordinates: { lat: 27.0512, lng: 88.4721 },
    timestamp: "2 hours ago",
    description: "Approximately 1,200 cubic meters of boulders and muddy debris came down following cloudburst in upper catchment. Culvert intake choked; water overflowing carriage surface.",
    status: "CREW_DISPATCHED",
    syncStatus: "SYNCED",
    aiAssessment: {
      severity: "CRITICAL",
      category: "High-Volume Landslide & Culvert Breach",
      damageSummary: "Dual-lane pavement covered in 1.8m thick mud and boulders. Subsurface edge eroded over 15 meters.",
      debrisVolumeEstimate: "Approx. 1,200 - 1,450 cubic meters",
      passability: {
        twoWheelers: "Impassable",
        lightMotorVehicles: "Impassable",
        heavyFreight: "Blocked",
        emergencyAmbulance: "Blocked (Stretcher carry only across rail bridge)",
      },
      estimatedClearanceHours: 16,
      machineryRequired: [
        "2x Heavy Tracked Excavators (Tata Hitachi 210)",
        "1x Wheel Loader & 6x Tippers",
        "Rock Breaker Attachment for 15-ton hanging boulders",
      ],
      supplyChainRiskRating: "CRITICAL",
      actionPlan: "Reroute perishable vaccines and milk supply vans via Lava-Reshi. BRO Task Force 88 mobilized from Sevoke camp.",
    },
  },
  {
    id: "rep-002",
    reporterName: "T. Jamir",
    officialDesignation: "Sub-Divisional Officer",
    department: "PWD_STATE",
    contact: "+91 98622-10492",
    incidentType: "Road Subsidence",
    district: "Dima Hasao",
    state: "Assam",
    corridorName: "NH-27 KM 112 (Jatinga)",
    coordinates: { lat: 25.1762, lng: 93.0234 },
    timestamp: "5 hours ago",
    description: "Subsoil failure along valley slope. 40m stretch slumped down by 1.4m. Retaining wall showing lateral shear cracks.",
    status: "VERIFIED_ACTIVE",
    syncStatus: "SYNCED",
    aiAssessment: {
      severity: "HIGH",
      category: "Structural Embankment Slumping",
      damageSummary: "Hillside lane stable, valley lane dropped 1.4m. Risk of further collapse if heavy 30T multi-axle freight passes.",
      debrisVolumeEstimate: "Subsoil settlement (no debris blocking hill lane)",
      passability: {
        twoWheelers: "Passable (Slow)",
        lightMotorVehicles: "Passable (Single file)",
        heavyFreight: "Restricted <16 Tons only",
        emergencyAmbulance: "Passable with siren escort",
      },
      estimatedClearanceHours: 24,
      machineryRequired: [
        "Crushed aggregate boulders & geotextile laying crew",
        "Pneumatic compactors",
      ],
      supplyChainRiskRating: "HIGH",
      actionPlan: "Station traffic marshals 24/7. Divert heavy POL tankers via Meghalaya route.",
    },
  },
];

export const nerCorridors = INITIAL_CORRIDORS;
export const nerBridges = STRATEGIC_BRIDGES_TUNNELS;
export const nerTrackedVehicles = INITIAL_VEHICLES;
export const nerDistrictConnectivity = DISTRICT_CONNECTIVITY_DATA;
export const nerAlerts = INITIAL_ALERTS;
export const nerIncidentReports = INITIAL_FIELD_REPORTS;
