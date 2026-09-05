export type NERState = 
  | "Assam"
  | "Arunachal Pradesh"
  | "Meghalaya"
  | "Manipur"
  | "Mizoram"
  | "Nagaland"
  | "Tripura"
  | "Sikkim";

export type CorridorStatus = "OPEN" | "RESTRICTED" | "HIGH_RISK" | "BLOCKED";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface StrategicBridgeOrTunnel {
  id: string;
  name: string;
  type: "BRIDGE" | "TUNNEL" | "PASS" | "FERRY_CROSSING";
  state: NERState;
  coordinates: Coordinates;
  elevationMeters: number;
  maxWeightTons: number;
  status: CorridorStatus;
  strategicImportance: string;
  details: string;
}

export type CriticalBridge = StrategicBridgeOrTunnel;

export interface HighwayCorridor {
  id: string;
  name: string;
  code: string;
  state: NERState;
  connectingDistricts: string[];
  startPoint: string;
  endPoint: string;
  coordinatesPath: Coordinates[];
  centerCoordinates: Coordinates;
  status: CorridorStatus;
  elevationProfile: string;
  currentDisruption?: {
    cause: "Landslide" | "Flash Flood" | "Bridge Collapse" | "Road Subsidence" | "Heavy Snow" | "Mudflow";
    description: string;
    mileageMarker: string;
    reportedTime: string;
    estimatedClearance: string;
  };
  environmentalMetrics: {
    rainfall24h: number; // mm
    rainfall72h: number; // mm
    soilSaturation: number; // percentage
    slopeInclineDegrees: number;
    hazardIndex: number; // 0-100
  };
  alternateRouteSummary?: string;
}

export type CargoCategory = 
  | "MEDICINES_VACCINES"
  | "PDS_FOOD_GRAINS"
  | "POL_FUEL_TANKERS"
  | "AGRI_HORTICULTURE"
  | "STRATEGIC_CONSTRUCTION_BRO"
  | "DISASTER_RELIEF";

export type VehicleStatus = "ON_TRACK" | "DELAYED" | "REROUTED" | "HALTED";

export interface TrackedVehicle {
  id: string;
  registrationNumber: string;
  driverName: string;
  contactNumber: string;
  cargoType: CargoCategory;
  cargoDescription: string;
  cargoPriority: "CRITICAL" | "HIGH" | "STANDARD";
  weightTons: number;
  origin: string;
  destination: string;
  currentCorridorId: string;
  coordinates: Coordinates;
  speedKmh: number;
  altitudeMeters: number;
  fuelBatteryPercent: number;
  status: VehicleStatus;
  delayMinutes: number;
  eta: string;
  temperatureControlled?: boolean;
  tempCelsius?: number;
  lastUpdated: string;
  breadcrumbs: Coordinates[];
  routeProgressIndex?: number;
  assignedCorridor?: string;
}

export interface FieldIncidentReport {
  id: string;
  reporterName: string;
  officialDesignation: string;
  department: "BRO" | "PWD_STATE" | "DISASTER_MGMT_SDMA" | "TRAFFIC_POLICE" | "FOREST_DEPT";
  contact: string;
  incidentType: "Landslide" | "Flash Flood" | "Bridge Damage" | "Road Subsidence" | "Rockfall" | "Traffic Choke";
  district: string;
  state: NERState;
  corridorName: string;
  coordinates: Coordinates;
  timestamp: string;
  description: string;
  photoUrl?: string;
  status: "PENDING_VERIFICATION" | "VERIFIED_ACTIVE" | "CREW_DISPATCHED" | "RESOLVED";
  syncStatus: "SYNCED" | "OFFLINE_PENDING";
  aiAssessment?: {
    severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
    category: string;
    damageSummary: string;
    debrisVolumeEstimate: string;
    passability: {
      twoWheelers: string;
      lightMotorVehicles: string;
      heavyFreight: string;
      emergencyAmbulance: string;
    };
    estimatedClearanceHours: number;
    machineryRequired: string[];
    supplyChainRiskRating: "CRITICAL" | "HIGH" | "MODERATE";
    actionPlan: string;
  };
}

export interface DistrictConnectivity {
  districtName: string;
  state: NERState;
  connectivityIndex: number; // 0 to 100
  isolationRisk: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  activeCutoffsCount: number;
  essentialStockStatus: {
    medicinesDaysRemaining: number;
    foodGrainsDaysRemaining: number;
    fuelDaysRemaining: number;
  };
  primaryLifeline: string;
  alternateRescueMode: "BAILEY_BRIDGE" | "RIVERINE_FERRY" | "AIR_DROP_HELIPAD" | "4x4_SPECIAL_CONVOY";
  coordinates: Coordinates;
}

export interface SystemAlert {
  id: string;
  corridor: string;
  state: NERState;
  severity: "CRITICAL" | "WARNING" | "ADVISORY";
  title: string;
  message: string;
  timestamp: string;
  affectedVehiclesCount: number;
  alternateAvailable: boolean;
}

export type SupportedLanguage = 
  | "English"
  | "Hindi"
  | "Assamese"
  | "Bengali"
  | "Manipuri"
  | "Mizo"
  | "Khasi"
  | "Nagamese";

export interface DisruptionPredictionResult {
  corridorName: string;
  state: string;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  disruptionProbability: number;
  inferredEnvironment: {
    rainfall24h: number;
    rainfall72h: number;
    soilSaturationPercent: number;
    slopeInclineDegrees: number;
    terrainNotes: string;
  };
  probableCauses: string[];
  expectedImpactWindow: string;
  clearingTimeEstimate: string;
  mitigationMeasures: string[];
  confidenceScore: number;
  strategicBrief?: string;
}

export interface AlternateRouteResult {
  primaryRoute: string;
  origin: string;
  destination: string;
  alternateRoutes: {
    name: string;
    detourDistanceKm: number;
    additionalDelayHours: number;
    terrainDifficulty: string;
    maxVehicleWeightTons: number;
    feasibilityScore: number;
    currentStatus: string;
    fuelConsumptionIncreasePercent: number;
    keyWaypoints: string[];
    tacticalAdvice: string;
  }[];
  strategicRecommendation: string;
}

export interface Warehouse {
  id: string;
  name: string;
  type: "STANDARD_WAREHOUSE" | "COLD_STORAGE" | "MULTI_MODAL_HUB";
  state: NERState;
  coordinates: Coordinates;
  capacityTons: number;
  currentOccupancyPercent: number;
  contactPerson: string;
  contactNumber: string;
  operatingHours: string;
  status: "OPERATIONAL" | "AT_CAPACITY" | "MAINTENANCE" | "CLOSED";
  associatedCorridorId: string;
}
