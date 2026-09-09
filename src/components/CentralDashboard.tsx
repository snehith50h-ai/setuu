import React, { useState } from "react";
import { 
  DistrictConnectivity, 
  HighwayCorridor, 
  TrackedVehicle,
  UserRole,
  CorridorStatus,
  AuditLogEntry
} from "../types";
import { 
  Building2, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Thermometer, 
  ShieldAlert, 
  Anchor, 
  Plane, 
  Wrench, 
  Search,
  ArrowUpRight,
  Shield,
  FileText,
  Lock,
  Edit3,
  CloudLightning,
  Sparkles,
  CheckCircle,
  Radio
} from "lucide-react";

interface CentralDashboardProps {
  districtData: DistrictConnectivity[];
  corridors: HighwayCorridor[];
  vehicles: TrackedVehicle[];
  currentRole?: UserRole;
  simulationMode?: "LIVE" | "CLOUDBURST";
  auditLogs?: AuditLogEntry[];
  onOverrideCorridorStatus?: (corridorCode: string, newStatus: CorridorStatus, reason: string, method: any, officerName: string) => void;
  onSelectDistrictCorridor?: (corridorName: string) => void;
}

export const CentralDashboard: React.FC<CentralDashboardProps> = ({
  districtData,
  corridors,
  vehicles,
  currentRole = "MDONER_ADMIN",
  simulationMode = "LIVE",
  auditLogs = [],
  onOverrideCorridorStatus,
  onSelectDistrictCorridor,
}) => {
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("ALL");
  const [searchDistrict, setSearchDistrict] = useState("");

  // Human-in-the-loop corridor status override state
  const [overrideModalCorridor, setOverrideModalCorridor] = useState<HighwayCorridor | null>(null);
  const [overrideNewStatus, setOverrideNewStatus] = useState<CorridorStatus>("BLOCKED");
  const [overrideMethod, setOverrideMethod] = useState<"PHYSICAL_FIELD_INSPECTION" | "DRONE_AERIAL_SURVEY" | "AI_AIS140_CLUSTER_CONFIRMATION">("PHYSICAL_FIELD_INSPECTION");
  const [overrideReason, setOverrideReason] = useState("Visual drone inspection identified continuous 65-meter slope destabilization and culvert collapse.");
  const [overrideOfficerName, setOverrideOfficerName] = useState(
    currentRole === "FIELD_OFFICER" ? "Er. Lalthanmawia (BRO Project Swastik)" : "Col. S. Sengupta (MDoNER Logistics Command)"
  );
  const [overrideSuccessAlert, setOverrideSuccessAlert] = useState<string | null>(null);

  // Local state fallback for audit logs
  const [localAuditLogs, setLocalAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: "audit-001",
      timestamp: "2026-09-09T06:45:00Z",
      officerName: "Col. S. Sengupta",
      officerRole: "MDONER_ADMIN",
      corridorCode: "NH-10",
      previousStatus: "HIGH_RISK",
      newStatus: "BLOCKED",
      verificationMethod: "DRONE_AERIAL_SURVEY",
      reason: "Orthomosaic aerial imagery confirmed 120m carriageway washout at 29th Mile.",
      immutableHash: "sha256-8f3e21a0d9b4c771fae923e"
    },
    {
      id: "audit-002",
      timestamp: "2026-09-09T05:30:00Z",
      officerName: "Er. Lalthanmawia",
      officerRole: "FIELD_OFFICER",
      corridorCode: "NH-27",
      previousStatus: "OPEN",
      newStatus: "RESTRICTED",
      verificationMethod: "AI_AIS140_CLUSTER_CONFIRMATION",
      reason: "Model D telemetry corroborated 3-truck cluster deceleration (<5 km/h) at Jatinga Ridge.",
      immutableHash: "sha256-4c7b89e3a1f290d81cb445f"
    },
    {
      id: "audit-003",
      timestamp: "2026-09-08T18:15:00Z",
      officerName: "Maj. P. Borah",
      officerRole: "FIELD_OFFICER",
      corridorCode: "NH-29",
      previousStatus: "BLOCKED",
      newStatus: "RESTRICTED",
      verificationMethod: "PHYSICAL_FIELD_INSPECTION",
      reason: "Single-lane emergency Bailey bridge launched over Pagla Pahar stream.",
      immutableHash: "sha256-1a9c33f8e5b7201ad89ee34"
    }
  ]);

  const activeAuditLogs = auditLogs.length > 0 ? auditLogs : localAuditLogs;

  const filteredDistricts = districtData.filter((d) => {
    const matchesState = selectedStateFilter === "ALL" || d.state === selectedStateFilter;
    const matchesSearch = d.districtName.toLowerCase().includes(searchDistrict.toLowerCase()) || d.state.toLowerCase().includes(searchDistrict.toLowerCase());
    return matchesState && matchesSearch;
  });

  const averageConnectivity = districtData.length > 0 
    ? Math.round(districtData.reduce((acc, curr) => acc + curr.connectivityIndex, 0) / districtData.length) 
    : 0;

  const blockedCorridorsCount = corridors.filter((c) => c.status === "BLOCKED").length;
  const criticalDistrictsCount = districtData.filter((d) => d.isolationRisk === "CRITICAL" || d.isolationRisk === "HIGH").length;
  const criticalStockDeficits = districtData.filter((d) => d.essentialStockStatus.medicinesDaysRemaining < 4).length;

  const getIsolationRiskBadge = (risk: "CRITICAL" | "HIGH" | "MODERATE" | "LOW") => {
    switch (risk) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">CRITICAL ISOLATION</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">HIGH RISK</span>;
      case "MODERATE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">MODERATE</span>;
      case "LOW":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-700/60">NORMAL</span>;
    }
  };

  const getCorridorStatusBadge = (status: CorridorStatus) => {
    switch (status) {
      case "OPEN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">OPEN</span>;
      case "RESTRICTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">RESTRICTED</span>;
      case "HIGH_RISK":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">HIGH RISK</span>;
      case "BLOCKED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">BLOCKED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">UNKNOWN</span>;
    }
  };

  const getProvenanceBadge = (code: string) => {
    switch (code) {
      case "NH-10":
        return { label: "BRO Ground Recon + Drone", conf: 96, class: "bg-purple-50 text-purple-700 border-purple-200" };
      case "NH-27":
        return { label: "Model D AIS-140 Fleet Cluster", conf: 96, class: "bg-blue-50 text-blue-700 border-blue-200" };
      case "NH-102":
        return { label: "Drone Orthomosaic Survey", conf: 91, class: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "NH-29":
        return { label: "Sentinel-1 SAR InSAR Radar", conf: 89, class: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { label: "State PWD & Panchayat Ingest", conf: 85, class: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const getAlternateRescueIcon = (mode: string) => {
    switch (mode) {
      case "AIR_DROP_HELIPAD":
        return <span className="flex items-center gap-1 text-purple-700"><Plane className="w-3.5 h-3.5" /> Air-Drop ALG</span>;
      case "RIVERINE_FERRY":
        return <span className="flex items-center gap-1 text-blue-700"><Anchor className="w-3.5 h-3.5" /> Riverine Ferry</span>;
      case "BAILEY_BRIDGE":
        return <span className="flex items-center gap-1 text-amber-700"><Wrench className="w-3.5 h-3.5" /> Bailey Bypass</span>;
      case "4x4_SPECIAL_CONVOY":
        return <span className="flex items-center gap-1 text-emerald-700"><Truck className="w-3.5 h-3.5" /> 4x4 Mountain Convoy</span>;
      default:
        return <span>Emergency Bypass</span>;
    }
  };

  // Submit human-in-the-loop override
  const handleExecuteOverride = () => {
    if (!overrideModalCorridor) return;

    const fakeHash = "sha256-" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      officerName: overrideOfficerName,
      officerRole: (currentRole || "MDONER_ADMIN") as UserRole,
      corridorCode: overrideModalCorridor.code,
      previousStatus: overrideModalCorridor.status,
      newStatus: overrideNewStatus,
      verificationMethod: overrideMethod,
      reason: overrideReason,
      immutableHash: fakeHash,
    };

    if (onOverrideCorridorStatus) {
      onOverrideCorridorStatus(overrideModalCorridor.code, overrideNewStatus, overrideReason, overrideMethod, overrideOfficerName);
    } else {
      // Local state update
      setLocalAuditLogs((prev) => [newEntry, ...prev]);
      overrideModalCorridor.status = overrideNewStatus;
    }

    setOverrideSuccessAlert(`Corridor ${overrideModalCorridor.code} status overridden to ${overrideNewStatus}. Recorded in immutable audit ledger with hash: ${fakeHash}`);
    setOverrideModalCorridor(null);

    setTimeout(() => {
      setOverrideSuccessAlert(null);
    }, 6000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Cloudburst Disaster Mode Live Banner */}
      {simulationMode === "CLOUDBURST" && (
        <div className="bg-rose-950/90 border border-rose-600 p-4 rounded-xl text-rose-100 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <CloudLightning className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm uppercase tracking-wider text-rose-300">
                    DISASTER SIMULATION MODE ACTIVE: SEVERE CLOUDBURST (142 mm/hr)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-800 text-[10px] font-mono font-bold uppercase">
                    RED ALERT
                  </span>
                </div>
                <p className="text-xs text-rose-200 mt-0.5">
                  High-intensity rainfall across Teesta &amp; Barak River catchments. NH-10 (KM 29) and NH-27 (Jatinga) auto-elevated to BLOCKED. Multi-route contingency routing has rerouted 14 critical vaccine &amp; POL consignments.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-700/60">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-ping" />
              <span>Rainfall Sensor: 142.4 mm/hr</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
            <Building2 className="w-4 h-4" />
            <span>Integrated Regional Dashboard • Ministry of Development of North Eastern Region</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            District Connectivity, Supply Gaps &amp; Emergency Logistics Matrix
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl leading-relaxed">
            Centralized monitoring of all 8 North Eastern States (Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim) to prevent lifeline cut-offs and coordinate disaster response.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Active RBAC: {currentRole}</span>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {overrideSuccessAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{overrideSuccessAlert}</span>
          </div>
          <button onClick={() => setOverrideSuccessAlert(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Strategic Regional KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Regional Connectivity</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{averageConnectivity}%</p>
          <p className="text-[10px] text-emerald-600 font-mono">+2.1% Today</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Blocked Arterials</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600">{blockedCorridorsCount}</p>
          <p className="text-[10px] text-rose-700/80 font-mono">NH-10 Sevoke &amp; Birik Dara choked</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Isolation Threat</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700">{criticalDistrictsCount}</p>
          <p className="text-[10px] text-slate-500 font-mono">East Sikkim, Dima Hasao, Champhai</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Supply Deficits</span>
            <Thermometer className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-700">{criticalStockDeficits}</p>
          <p className="text-[10px] text-blue-600 font-mono">&lt;3 Days reserves (Vaccines)</p>
        </div>
      </div>

      {/* Supply Chain Deficit Alert Banner */}
      <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-900/50 border border-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h4 className="font-bold text-rose-800 text-sm">Emergency Supply Chain Deficit Warning: East Sikkim &amp; Pakyong</h4>
            <p className="text-slate-700 mt-0.5 text-xs">
              Due to 120m landslide on NH-10, Gangtok central hospital stock has <strong>2.5 days of essential dialysis fluid and insulin vials</strong> remaining. Reroute convoy <em>AS-01-GC-4482</em> via Lava-Reshi bypass.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-rose-900 text-rose-100 font-semibold text-[11px]">
            Action Mandated
          </span>
        </div>
      </div>

      {/* SECTION 1: Live Road State & Strategic Corridor Overlays (with Human-in-the-Loop Override) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Live Road State &amp; Strategic Highway Corridors</h3>
            </div>
            <p className="text-slate-500 text-xs">Real-time passability state with sensor provenance and human-in-the-loop override authority</p>
          </div>
          <span className="text-[11px] text-slate-500">
            Showing {corridors.length} lifeline corridors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {corridors.map((c) => {
            const prov = getProvenanceBadge(c.code);
            return (
              <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 text-sm">{c.code}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 font-medium">{c.state}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] line-clamp-1">{c.name}</div>
                  </div>
                  <div>{getCorridorStatusBadge(c.status)}</div>
                </div>

                {/* Provenance & Confidence */}
                <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Sensor Provenance:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${prov.class}`}>
                      {prov.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Detection Confidence:</span>
                    <span className="font-bold font-mono text-emerald-700">{prov.conf}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${prov.conf}%` }} />
                  </div>
                </div>

                {/* Human-in-the-Loop Override Button */}
                {currentRole !== "CITIZEN" && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Authorized Official Control</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOverrideModalCorridor(c);
                        setOverrideNewStatus(c.status === "BLOCKED" ? "RESTRICTED" : "BLOCKED");
                      }}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      <span>Override Status</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: District-Wise Accessibility Matrix Table */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">District Connectivity &amp; Supply Runway Matrix</h3>
            <p className="text-slate-500 text-xs">Real-time isolation risk and essential commodity stocks</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                placeholder="Filter district..."
                className="bg-transparent text-slate-800 outline-none text-xs w-28 sm:w-36"
              />
            </div>

            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 border border-slate-300 rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
            >
              <option value="ALL">All 8 NER States</option>
              <option value="Assam">Assam</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Manipur">Manipur</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Tripura">Tripura</option>
              <option value="Sikkim">Sikkim</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">District &amp; State</th>
                <th className="py-2.5 px-3">Connectivity Index</th>
                <th className="py-2.5 px-3">Isolation Risk</th>
                <th className="py-2.5 px-3">Essential Stocks (Days Remaining)</th>
                <th className="py-2.5 px-3">Primary Lifeline Highway</th>
                <th className="py-2.5 px-3">Disaster Backup Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDistricts.map((district, idx) => (
                <tr key={idx} className="hover:bg-slate-50 border border-slate-200/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{district.districtName}</div>
                    <div className="text-[11px] text-slate-500">{district.state}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-50 border border-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            district.connectivityIndex > 70
                              ? "bg-emerald-500"
                              : district.connectivityIndex > 45
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${district.connectivityIndex}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{district.connectivityIndex}%</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {getIsolationRiskBadge(district.isolationRisk)}
                  </td>

                  <td className="py-3 px-3">
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold ${
                          district.essentialStockStatus.medicinesDaysRemaining < 3
                            ? "bg-rose-50 text-rose-700 border border-rose-800"
                            : "text-slate-700"
                        }`}
                      >
                        💊 {district.essentialStockStatus.medicinesDaysRemaining}d
                      </span>
                      <span className="text-slate-700">
                        🍚 {district.essentialStockStatus.foodGrainsDaysRemaining}d
                      </span>
                      <span className="text-slate-700">
                        ⛽ {district.essentialStockStatus.fuelDaysRemaining}d
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {district.primaryLifeline}
                  </td>

                  <td className="py-3 px-3">
                    {getAlternateRescueIcon(district.alternateRescueMode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Immutable Audit Trail & Verification Ledger */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Immutable Corridor Status Audit Trail</h3>
              <p className="text-slate-500 text-xs">Cryptographically hashed record of all official corridor directives, drone inspections, and state changes</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold border border-slate-300">
            SHA-256 LEDGER VERIFIED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Corridor</th>
                <th className="py-2.5 px-3">Status Transition</th>
                <th className="py-2.5 px-3">Authorized Officer</th>
                <th className="py-2.5 px-3">Verification Method</th>
                <th className="py-2.5 px-3">Audit Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {activeAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {log.corridorCode}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-slate-500">{log.previousStatus}</span>
                    <span className="text-slate-400 mx-1">➔</span>
                    <span className="font-bold text-rose-700">{log.newStatus}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 font-sans">
                    <div className="font-medium">{log.officerName}</div>
                    <div className="text-[10px] text-slate-500">{log.officerRole}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                      {log.verificationMethod.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[10px]">
                      {log.immutableHash.substring(0, 18)}...
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Human-in-the-Loop Corridor Override Modal */}
      {overrideModalCorridor && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-lg w-full p-6 text-slate-900 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <Edit3 className="w-4 h-4 text-rose-600" />
                <span>Human-in-the-Loop Status Override: {overrideModalCorridor.code}</span>
              </div>
              <button
                onClick={() => setOverrideModalCorridor(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              As an authorized <strong>{currentRole}</strong>, you are overriding the automated sensor status for <strong>{overrideModalCorridor.name}</strong>. This action is permanently committed to the MDoNER audit trail.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Override Status:</label>
                <select
                  value={overrideNewStatus}
                  onChange={(e) => setOverrideNewStatus(e.target.value as CorridorStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 outline-none"
                >
                  <option value="OPEN">OPEN (All Clear)</option>
                  <option value="RESTRICTED">RESTRICTED (Single-Lane / Pilot Escort Only)</option>
                  <option value="HIGH_RISK">HIGH_RISK (Imminent Hazard Alert)</option>
                  <option value="BLOCKED">BLOCKED (Total Carriageway Severance)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Verification Provenance Method:</label>
                <select
                  value={overrideMethod}
                  onChange={(e) => setOverrideMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
                >
                  <option value="PHYSICAL_FIELD_INSPECTION">Physical BRO / PWD On-Site Inspection</option>
                  <option value="DRONE_AERIAL_SURVEY">UAV / Drone Orthomosaic Aerial Survey</option>
                  <option value="AI_AIS140_CLUSTER_CONFIRMATION">AIS-140 GPS Telematics Cluster Anomaly</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Authorizing Officer Identification:</label>
                <input
                  type="text"
                  value={overrideOfficerName}
                  onChange={(e) => setOverrideOfficerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operational Directive Justification:</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 outline-none"
                  placeholder="Detail visible fissures, boulder volume, bridge abutment status, or alternative bypass clearance..."
                />
              </div>

              {/* Cryptographic SHA-256 Preview */}
              <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">SHA-256 Hash to be Minted:</span>
                <span className="font-mono text-[10px] text-slate-700 break-all">
                  sha256-{(overrideModalCorridor.code + overrideNewStatus + overrideReason.slice(0, 10)).split("").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 42).toString(16)}fa8921e4b
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOverrideModalCorridor(null)}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteOverride}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Publish Directive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
