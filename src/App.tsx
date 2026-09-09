import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { 
  HighwayCorridor, 
  TrackedVehicle, 
  CriticalBridge, 
  FieldIncidentReport, 
  DistrictConnectivity, 
  SystemAlert, 
  SupportedLanguage,
  Warehouse,
  UserRole,
  CorridorStatus,
  AuditLogEntry
} from "./types";
import { Header } from "./components/Header";
import { GISMap } from "./components/GISMap";
import { CentralDashboard } from "./components/CentralDashboard";
import { DisruptionPredictor } from "./components/DisruptionPredictor";
import { AlternateRouteEngine } from "./components/AlternateRouteEngine";
import { VehicleTrackingPanel } from "./components/VehicleTrackingPanel";
import { FieldIncidentUploader } from "./components/FieldIncidentUploader";
import { AlertsAndMultilingualModal } from "./components/AlertsAndMultilingualModal";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { 
  Map as MapIcon, 
  BarChart3, 
  ShieldAlert, 
  RefreshCw, 
  Truck, 
  Camera, 
  Bell, 
  Wifi, 
  WifiOff, 
  Activity,
  Layers,
  HelpCircle,
  Clock
} from "lucide-react";

type ActiveTab = 
  | "GIS_MAP"
  | "CENTRAL_DASHBOARD"
  | "PREDICTION_ENGINE"
  | "ALTERNATE_ROUTES"
  | "FLEET_TRACKING"
  | "INCIDENT_UPLOADER";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("GIS_MAP");
  const [corridors, setCorridors] = useState<HighwayCorridor[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState<HighwayCorridor | null>(null);
  
  const [vehicles, setVehicles] = useState<TrackedVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<TrackedVehicle | null>(null);

  const [bridges, setBridges] = useState<CriticalBridge[]>([]);
  const [incidents, setIncidents] = useState<FieldIncidentReport[]>([]);
  const [districtData, setDistrictData] = useState<DistrictConnectivity[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>("English");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // RBAC Role & Disaster Simulation Mode
  const [currentRole, setCurrentRole] = useState<UserRole>("MDONER_ADMIN");
  const [simulationMode, setSimulationMode] = useState<"LIVE" | "CLOUDBURST">("LIVE");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: "audit-init-1",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      officerName: "Col. S. Sengupta",
      officerRole: "MDONER_ADMIN",
      corridorCode: "NH-10",
      previousStatus: "HIGH_RISK",
      newStatus: "BLOCKED",
      verificationMethod: "DRONE_AERIAL_SURVEY",
      reason: "Orthomosaic imagery confirmed 120m carriageway breach at 29th Mile.",
      immutableHash: "sha256-8f3e21a0d9b4c771fae923e"
    },
    {
      id: "audit-init-2",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      officerName: "Er. Lalthanmawia",
      officerRole: "FIELD_OFFICER",
      corridorCode: "NH-27",
      previousStatus: "OPEN",
      newStatus: "RESTRICTED",
      verificationMethod: "AI_AIS140_CLUSTER_CONFIRMATION",
      reason: "AIS-140 telematics corroborated 3-truck cluster deceleration (<5 km/h) at Jatinga Ridge.",
      immutableHash: "sha256-4c7b89e3a1f290d81cb445f"
    }
  ]);

  const handleToggleSimulationMode = () => {
    setSimulationMode((prev) => {
      const next = prev === "LIVE" ? "CLOUDBURST" : "LIVE";
      if (next === "CLOUDBURST") {
        setCorridors((curr) =>
          curr.map((c) => (c.code === "NH-10" || c.code === "NH-27" ? { ...c, status: "BLOCKED" } : c))
        );
      }
      return next;
    });
  };

  const handleOverrideCorridorStatus = async (
    corridorCode: string,
    newStatus: CorridorStatus,
    reason: string,
    method: any,
    officerName: string
  ) => {
    setCorridors((prev) => prev.map((c) => (c.code === corridorCode ? { ...c, status: newStatus } : c)));
    const fakeHash = "sha256-" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      officerName,
      officerRole: currentRole,
      corridorCode,
      previousStatus: corridors.find((c) => c.code === corridorCode)?.status || "OPEN",
      newStatus,
      verificationMethod: method,
      reason,
      immutableHash: fakeHash,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    const targetCorridor = corridors.find((c) => c.code === corridorCode);
    if (targetCorridor && targetCorridor.id) {
      try {
        const corridorRef = doc(db, "corridors", targetCorridor.id);
        await updateDoc(corridorRef, { status: newStatus });
      } catch (e) {
        console.warn("Firestore sync error:", e);
      }
    }
  };

  // Live GPS Telemetry Simulation
  const [isSimulatingTelemetry, setIsSimulatingTelemetry] = useState(true);
  const [detailedRoutes, setDetailedRoutes] = useState<Record<string, {lat: number, lng: number}[]>>({});

  useEffect(() => {
    fetch('/detailedRoutes.json')
      .then(res => {
        if (!res.ok) throw new Error("Not OK");
        return res.json();
      })
      .then(data => setDetailedRoutes(data))
      .catch(err => {
        // Silently fail if detailed routes are unavailable (e.g. adblocker, SW cache miss, or dev server startup delay).
        // The app will gracefully fall back to straight-line interpolation between waypoints.
      });
  }, []);

  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, "corridors"), (snap) => {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as HighwayCorridor));
        setCorridors(data);
        setSelectedCorridor(prev => prev || data[0] || null);
      }),
      onSnapshot(collection(db, "vehicles"), (snap) => {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as TrackedVehicle));
        setVehicles(data);
        setSelectedVehicle(prev => prev || data[0] || null);
      }),
      onSnapshot(collection(db, "bridges"), (snap) => {
        setBridges(snap.docs.map(d => ({ ...d.data(), id: d.id } as CriticalBridge)));
      }),
      onSnapshot(collection(db, "incidents"), (snap) => {
        setIncidents(snap.docs.map(d => ({ ...d.data(), id: d.id } as FieldIncidentReport)));
      }),
      onSnapshot(collection(db, "districts"), (snap) => {
        setDistrictData(snap.docs.map(d => ({ ...d.data(), id: d.id } as unknown as DistrictConnectivity)));
      }),
      onSnapshot(collection(db, "warehouses"), (snap) => {
        setWarehouses(snap.docs.map(d => ({ ...d.data(), id: d.id } as Warehouse)));
      }),
      onSnapshot(collection(db, "alerts"), (snap) => {
        setAlerts(snap.docs.map(d => ({ ...d.data(), id: d.id } as SystemAlert)));
        setLoading(false);
      })
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  // Step simulated vehicle movements (writes to Firebase)
  const stepVehiclePositions = async () => {
    if (!vehicles || vehicles.length === 0) return;
    const updates = vehicles.map((veh) => {
      if (veh.status === "HALTED") return Promise.resolve();

      let newLat, newLng, newProgressIndex = veh.routeProgressIndex || 0;
      
      const corridor = corridors.find(c => c.id === veh.currentCorridorId || (veh.currentCorridorId && veh.currentCorridorId.toLowerCase() === `corridor-${c.code.toLowerCase().replace('-', '')}`));
      const routePath = corridor && detailedRoutes[corridor.code] ? detailedRoutes[corridor.code] : null;

      if (routePath && routePath.length > 0) {
        const jump = Math.max(1, Math.floor(veh.speedKmh / 5));
        newProgressIndex = (newProgressIndex + jump) % routePath.length;
        newLat = routePath[newProgressIndex].lat;
        newLng = routePath[newProgressIndex].lng;
      } else {
        const latDelta = (Math.random() - 0.48) * 0.003;
        const lngDelta = (Math.random() - 0.48) * 0.003;
        newLat = veh.coordinates.lat + latDelta;
        newLng = veh.coordinates.lng + lngDelta;
      }

      const newBreadcrumb = { lat: newLat, lng: newLng };
      const updatedBreadcrumbs = [...veh.breadcrumbs.slice(-5), newBreadcrumb];
      const speedVar = Math.max(10, Math.min(55, veh.speedKmh + Math.floor(Math.random() * 5 - 2)));

      const docRef = doc(db, "vehicles", veh.id!);
      return updateDoc(docRef, {
        coordinates: { lat: newLat, lng: newLng },
        speedKmh: speedVar,
        breadcrumbs: updatedBreadcrumbs,
        routeProgressIndex: newProgressIndex,
      });
    });
    await Promise.all(updates);
  };

  useEffect(() => {
    if (!isSimulatingTelemetry) return;
    const interval = setInterval(stepVehiclePositions, 4500);
    return () => clearInterval(interval);
  }, [isSimulatingTelemetry, vehicles, corridors, detailedRoutes]);

  // Handler to add newly reported incident from field officials
  const handleAddIncident = async (newReport: FieldIncidentReport) => {
    const reportRef = doc(collection(db, "incidents"));
    await setDoc(reportRef, { ...newReport, id: reportRef.id });

    // Also update corridors and generate system alert
    const targetCorridor = corridors.find((c) => c.name.includes(newReport.corridorName) || newReport.corridorName.includes(c.name));
    if (targetCorridor && targetCorridor.id) {
      const corridorRef = doc(db, "corridors", targetCorridor.id);
      await updateDoc(corridorRef, {
        status: "BLOCKED",
        currentDisruption: {
          type: newReport.incidentType as any,
          severity: newReport.aiAssessment?.severity || "CRITICAL",
          location: newReport.district,
          description: newReport.description,
          reportedAt: newReport.timestamp,
          estimatedClearanceTime: `${newReport.aiAssessment?.estimatedClearanceHours || 12} Hours`,
          alternateRouteSuggested: "Secondary bypass under review",
        },
      });
    }

    const mappedSeverity = 
      newReport.aiAssessment?.severity === "CRITICAL"
        ? "CRITICAL"
        : newReport.aiAssessment?.severity === "HIGH"
        ? "WARNING"
        : "ADVISORY";

    const alertRef = doc(collection(db, "alerts"));
    await setDoc(alertRef, {
      id: alertRef.id,
      corridor: newReport.corridorName,
      state: newReport.state,
      title: `Field Incident Verified: ${newReport.incidentType} in ${newReport.district}`,
      message: `${newReport.description} (Reported by ${newReport.reporterName}, ${newReport.department})`,
      severity: mappedSeverity,
      timestamp: "Just now",
      affectedVehiclesCount: 15,
      alternateAvailable: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Syncing with secure Govt server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-200">
      {/* Top Universal MDoNER Platform Header */}
      <Header
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        alertsCount={alerts.length}
        onOpenAlertsModal={() => setIsAlertModalOpen(true)}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        simulationMode={simulationMode}
        onToggleSimulationMode={handleToggleSimulationMode}
      />

      {/* Primary Navigation Bar */}
      <nav aria-label="Main Navigation" className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              id="tab-gis-map-btn"
              onClick={() => setActiveTab("GIS_MAP")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "GIS_MAP"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>GIS Geospatial Map</span>
            </button>

            <button
              id="tab-central-dashboard-btn"
              onClick={() => setActiveTab("CENTRAL_DASHBOARD")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "CENTRAL_DASHBOARD"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>District Supply & Connectivity</span>
            </button>

            <button
              id="tab-disruption-prediction-btn"
              onClick={() => setActiveTab("PREDICTION_ENGINE")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "PREDICTION_ENGINE"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>AI Disruption Predictor</span>
            </button>

            <button
              id="tab-alternate-routes-btn"
              onClick={() => setActiveTab("ALTERNATE_ROUTES")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "ALTERNATE_ROUTES"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Contingency Rerouting Engine</span>
            </button>

            <button
              id="tab-fleet-tracking-btn"
              onClick={() => setActiveTab("FLEET_TRACKING")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "FLEET_TRACKING"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>GPS Supplies Tracking</span>
            </button>

            <button
              id="tab-incident-uploader-btn"
              onClick={() => setActiveTab("INCIDENT_UPLOADER")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === "INCIDENT_UPLOADER"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Field Incident Reporter</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 pl-4 border-l border-slate-200">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{vehicles.length} GPS Convoys Live</span>
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 py-4">
        {activeTab === "GIS_MAP" && (
          <GISMap
            detailedRoutes={detailedRoutes}
            corridors={corridors}
            warehouses={warehouses}
            vehicles={vehicles}
            bridges={bridges}
            incidents={incidents}
            selectedCorridor={selectedCorridor}
            onSelectCorridor={(corridor) => {
              setSelectedCorridor(corridor);
            }}
            onSelectVehicle={(vehicle) => {
              setSelectedVehicle(vehicle);
              setActiveTab("FLEET_TRACKING");
            }}
            onSelectIncident={() => {
              setActiveTab("INCIDENT_UPLOADER");
            }}
            onTriggerDisruptionAnalysis={(corridor) => {
              setSelectedCorridor(corridor);
              setActiveTab("PREDICTION_ENGINE");
            }}
          />
        )}

        {activeTab === "CENTRAL_DASHBOARD" && (
          <CentralDashboard
            districtData={districtData}
            corridors={corridors}
            vehicles={vehicles}
            currentRole={currentRole}
            simulationMode={simulationMode}
            auditLogs={auditLogs}
            onOverrideCorridorStatus={handleOverrideCorridorStatus}
            onSelectDistrictCorridor={(corridorName) => {
              const c = corridors.find((item) => item.name === corridorName);
              if (c) {
                setSelectedCorridor(c);
                setActiveTab("PREDICTION_ENGINE");
              }
            }}
          />
        )}

        {activeTab === "PREDICTION_ENGINE" && (
          <DisruptionPredictor
            corridors={corridors}
            selectedCorridor={selectedCorridor}
            onSelectCorridor={setSelectedCorridor}
            onNavigateToAlternateRoutes={(corridor) => {
              setSelectedCorridor(corridor);
              setActiveTab("ALTERNATE_ROUTES");
            }}
          />
        )}

        {activeTab === "ALTERNATE_ROUTES" && (
          <AlternateRouteEngine
            corridors={corridors}
            selectedCorridor={selectedCorridor}
            onSelectCorridor={setSelectedCorridor}
          />
        )}

        {activeTab === "FLEET_TRACKING" && (
          <VehicleTrackingPanel
            vehicles={vehicles}
            corridors={corridors}
            onSelectVehicle={setSelectedVehicle}
            onRerouteVehicle={(vehicle) => {
              const matchedCorridor = corridors.find((c) => c.id === vehicle.currentCorridorId || (vehicle.currentCorridorId && vehicle.currentCorridorId.toLowerCase() === `corridor-${c.code.toLowerCase().replace('-', '')}`));
              if (matchedCorridor) {
                setSelectedCorridor(matchedCorridor);
              }
              setActiveTab("ALTERNATE_ROUTES");
            }}
            onSimulateTelemetryStep={stepVehiclePositions}
            isSimulatingTelemetry={isSimulatingTelemetry}
            setIsSimulatingTelemetry={setIsSimulatingTelemetry}
          />
        )}

        {activeTab === "INCIDENT_UPLOADER" && (
          <FieldIncidentUploader
            corridors={corridors}
            isOnline={isOnline}
            onAddIncidentReport={handleAddIncident}
          />
        )}
      </main>

      {/* Multilingual Alerts & Audio Dispatch Modal */}
      <AlertsAndMultilingualModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        alerts={alerts}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      <OfflineIndicator />

      {/* Footer Info */}
      <footer className="h-12 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-500 mt-auto shrink-0 font-medium">
        <div className="flex gap-6 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500"></span> Open Corridor</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500"></span> Cautionary</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-rose-500"></span> Restricted</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 font-mono">SECURE GOVT SERVER // PORT 8082</span>
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded text-slate-700 font-semibold">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            {isOnline ? "SYNCED" : "OFFLINE"}
          </div>
        </div>
      </footer>
    </div>
  );
}
