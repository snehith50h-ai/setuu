import React, { useState } from "react";
import { 
  DistrictConnectivity, 
  HighwayCorridor, 
  TrackedVehicle 
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
  ArrowUpRight
} from "lucide-react";

interface CentralDashboardProps {
  districtData: DistrictConnectivity[];
  corridors: HighwayCorridor[];
  vehicles: TrackedVehicle[];
  onSelectDistrictCorridor?: (corridorName: string) => void;
}

export const CentralDashboard: React.FC<CentralDashboardProps> = ({
  districtData,
  corridors,
  vehicles,
  onSelectDistrictCorridor,
}) => {
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("ALL");
  const [searchDistrict, setSearchDistrict] = useState("");

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

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
            <Building2 className="w-4 h-4" />
            <span>Integrated Regional Dashboard • Ministry of Development of North Eastern Region</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            District Connectivity, Supply Gaps & Emergency Logistics Matrix
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl leading-relaxed">
            Centralized monitoring of all 8 North Eastern States (Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim) to prevent lifeline cut-offs and coordinate disaster response.
          </p>
        </div>
      </div>

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
          <p className="text-[10px] text-rose-700/80 font-mono">NH-10 Sevoke & Birik Dara choked</p>
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
            <h4 className="font-bold text-rose-200 text-sm">Emergency Supply Chain Deficit Warning: East Sikkim & Pakyong</h4>
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

      {/* District-Wise Accessibility Matrix Table */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">District Connectivity & Supply Runway Matrix</h3>
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
                <th className="py-2.5 px-3">District & State</th>
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
    </div>
  );
};
