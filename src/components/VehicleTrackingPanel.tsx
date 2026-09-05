import React, { useState } from "react";
import { 
  TrackedVehicle, 
  CargoCategory, 
  VehicleStatus,
  HighwayCorridor
} from "../types";
import { 
  Truck, 
  Search, 
  Filter, 
  Radio, 
  AlertCircle, 
  Clock, 
  Compass, 
  BatteryMedium, 
  Thermometer, 
  PhoneCall, 
  Sparkles, 
  MapPin, 
  RefreshCw,
  SlidersHorizontal,
  Plus
} from "lucide-react";
import { AddVehicleModal } from "./AddVehicleModal";

interface VehicleTrackingPanelProps {
  vehicles: TrackedVehicle[];
  corridors: HighwayCorridor[];
  onSelectVehicle: (vehicle: TrackedVehicle) => void;
  onRerouteVehicle: (vehicle: TrackedVehicle) => void;
  onSimulateTelemetryStep: () => void;
  isSimulatingTelemetry: boolean;
  setIsSimulatingTelemetry: (sim: boolean) => void;
}

export const VehicleTrackingPanel: React.FC<VehicleTrackingPanelProps> = ({
  vehicles,
  corridors,
  onSelectVehicle,
  onRerouteVehicle,
  onSimulateTelemetryStep,
  isSimulatingTelemetry,
  setIsSimulatingTelemetry,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCargoFilter, setSelectedCargoFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState<TrackedVehicle | null>(vehicles[0] || null);

  const cargoIcons: Record<CargoCategory, string> = {
    MEDICINES_VACCINES: "💊",
    PDS_FOOD_GRAINS: "🍚",
    POL_FUEL_TANKERS: "⛽",
    AGRI_HORTICULTURE: "🍍",
    STRATEGIC_CONSTRUCTION_BRO: "🏗️",
    DISASTER_RELIEF: "⚡",
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.cargoDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCargo = selectedCargoFilter === "ALL" || v.cargoType === selectedCargoFilter;
    const matchesStatus = selectedStatusFilter === "ALL" || v.status === selectedStatusFilter;

    return matchesSearch && matchesCargo && matchesStatus;
  });

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case "ON_TRACK":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">ON TRACK</span>;
      case "DELAYED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">DELAYED</span>;
      case "REROUTED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">REROUTED</span>;
      case "HALTED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">HALTED / BLOCKED</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header Banner with Live Telemetry Controls */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 p-5 rounded-xl border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Real-Time GPS Fleet & Critical Supplies Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Essential Supplies Convoy Monitoring (MDoNER / NIC Logistics Data)
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl leading-relaxed">
            Live satellite tracking of cold-chain vaccines, public distribution food grains, POL petroleum tankers, and border infrastructure freight traversing high-altitude mountain bottlenecks.
          </p>
        </div>

        {/* Live Simulation Trigger Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="simulate-telemetry-toggle-btn"
            onClick={() => setIsSimulatingTelemetry(!isSimulatingTelemetry)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
              isSimulatingTelemetry
                ? "bg-emerald-600 text-slate-900 border-emerald-400 shadow-md shadow-emerald-600/30"
                : "bg-slate-50 border border-slate-200 text-slate-700 border-slate-300 hover:bg-slate-200"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulatingTelemetry ? "animate-spin" : ""}`} />
            <span>{isSimulatingTelemetry ? "GPS Stream Active (Live)" : "Start Simulated GPS Stream"}</span>
          </button>

          <button
            id="step-telemetry-btn"
            onClick={onSimulateTelemetryStep}
            title="Step simulated vehicle positions along corridors"
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          
          <div className="h-6 w-px bg-slate-300 mx-1"></div>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by registration number, driver, destination, or cargo..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-500 outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="cargo-filter-select"
              value={selectedCargoFilter}
              onChange={(e) => setSelectedCargoFilter(e.target.value)}
              className="bg-transparent text-slate-800 outline-none text-xs cursor-pointer"
            >
              <option value="ALL" className="bg-white">All Cargo Categories</option>
              <option value="MEDICINES_VACCINES" className="bg-white">💊 Medicines & Vaccines</option>
              <option value="PDS_FOOD_GRAINS" className="bg-white">🍚 PDS Food Grains</option>
              <option value="POL_FUEL_TANKERS" className="bg-white">⛽ POL Fuel Tankers</option>
              <option value="STRATEGIC_CONSTRUCTION_BRO" className="bg-white">🏗️ Strategic Construction</option>
              <option value="AGRI_HORTICULTURE" className="bg-white">🍍 Agri / Horticulture</option>
              <option value="DISASTER_RELIEF" className="bg-white">⚡ Disaster Relief</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="status-filter-select"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 outline-none text-xs cursor-pointer"
            >
              <option value="ALL" className="bg-white">All Statuses</option>
              <option value="ON_TRACK" className="bg-white">On Track</option>
              <option value="DELAYED" className="bg-white">Delayed</option>
              <option value="REROUTED" className="bg-white">Rerouted</option>
              <option value="HALTED" className="bg-white">Halted / Staged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Vehicle List on Left, Detailed Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Vehicles */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3 overflow-y-auto max-h-[620px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">
              Active Monitored Convoys ({filteredVehicles.length})
            </span>
            <span className="text-[11px] text-slate-500">GPS Ping: Every 5s</span>
          </div>

          <div className="space-y-2.5">
            {filteredVehicles.map((veh) => {
              const isSelected = activeVehicle?.id === veh.id;
              return (
                <div
                  key={veh.id}
                  onClick={() => {
                    setActiveVehicle(veh);
                    onSelectVehicle(veh);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all space-y-2 text-xs ${
                    isSelected
                      ? "bg-slate-50 border border-slate-200 border-indigo-500/60 shadow-md"
                      : "bg-slate-50 hover:bg-slate-50 border-slate-300/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cargoIcons[veh.cargoType]}</span>
                      <div>
                        <h4 className="font-bold text-slate-900">{veh.registrationNumber}</h4>
                        <p className="text-[11px] text-slate-500">{veh.driverName}</p>
                      </div>
                    </div>
                    {getStatusBadge(veh.status)}
                  </div>

                  <p className="text-slate-700 text-[11px] line-clamp-1">{veh.cargoDescription}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Speed: <strong className="text-slate-800">{veh.speedKmh} km/h</strong></span>
                    <span>Altitude: <strong className="text-blue-700">{veh.altitudeMeters}m</strong></span>
                    <span>ETA: <strong className="text-amber-700">{veh.eta}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Single Vehicle Telemetry Card */}
        <div className="lg:col-span-2 space-y-5">
          {activeVehicle ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 border border-slate-300 flex items-center justify-center text-2xl">
                    {cargoIcons[activeVehicle.cargoType]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{activeVehicle.registrationNumber}</h3>
                      {getStatusBadge(activeVehicle.status)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Driver: <strong className="text-slate-800">{activeVehicle.driverName}</strong> | 
                      Contact: <a href={`tel:${activeVehicle.contactNumber}`} className="text-blue-600 hover:underline">{activeVehicle.contactNumber}</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="reroute-selected-vehicle-btn"
                    onClick={() => onRerouteVehicle(activeVehicle)}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-slate-900 font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reroute Convoy with AI</span>
                  </button>
                </div>
              </div>

              {/* Cargo & Cold-Chain Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px]">Consignment Priority:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{activeVehicle.cargoPriority} PRIORITY</p>
                  <p className="text-slate-500 text-[11px] mt-1">{activeVehicle.weightTons} Gross Tonnes</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px]">Route Path:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{activeVehicle.origin}</p>
                  <p className="text-blue-600 font-semibold text-[11px]">➔ {activeVehicle.destination}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px]">Cold Chain Status:</span>
                  {activeVehicle.temperatureControlled ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold mt-0.5">
                      <Thermometer className="w-4 h-4 text-emerald-600" />
                      <span>{activeVehicle.tempCelsius}°C (Secure)</span>
                    </div>
                  ) : (
                    <p className="text-slate-500 font-medium mt-0.5">Ambient Dry Cargo</p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-1">Vaccine temperature nominal</p>
                </div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200/40 p-3 rounded-lg border border-slate-300/40 text-center">
                  <span className="text-slate-500 text-[11px]">Current Speed</span>
                  <p className="text-lg font-bold text-emerald-700 mt-1">{activeVehicle.speedKmh} km/h</p>
                </div>

                <div className="bg-slate-50 border border-slate-200/40 p-3 rounded-lg border border-slate-300/40 text-center">
                  <span className="text-slate-500 text-[11px]">Altitude (ASL)</span>
                  <p className="text-lg font-bold text-blue-700 mt-1">{activeVehicle.altitudeMeters} m</p>
                </div>

                <div className="bg-slate-50 border border-slate-200/40 p-3 rounded-lg border border-slate-300/40 text-center">
                  <span className="text-slate-500 text-[11px]">Fuel / Battery</span>
                  <p className="text-lg font-bold text-amber-700 mt-1">{activeVehicle.fuelBatteryPercent}%</p>
                </div>

                <div className="bg-slate-50 border border-slate-200/40 p-3 rounded-lg border border-slate-300/40 text-center">
                  <span className="text-slate-500 text-[11px]">Estimated Delay</span>
                  <p className="text-lg font-bold text-rose-700 mt-1">+{activeVehicle.delayMinutes} mins</p>
                </div>
              </div>

              {/* Breadcrumb GPS Trail Points */}
              <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-lg border border-slate-300/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>GPS Telemetry Breadcrumbs & Coordinates</span>
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Current Lat: {activeVehicle.coordinates.lat.toFixed(4)}, Lng: {activeVehicle.coordinates.lng.toFixed(4)}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-300/60">
                  {activeVehicle.breadcrumbs.map((pt, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-500 bg-white/60 px-2.5 py-1.5 rounded">
                      <span>Waypoint #{idx + 1}</span>
                      <span className="font-mono text-slate-700">{pt.lat.toFixed(4)}°N, {pt.lng.toFixed(4)}°E</span>
                      <span className="text-emerald-600 text-[10px]">Ping Verified</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SOS Emergency Call Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
                <span>Driver SOS Support: Police / SDRF Emergency Line</span>
                <a
                  href={`tel:${activeVehicle.contactNumber}`}
                  className="px-3 py-1.5 rounded bg-rose-50/80 text-rose-700 border border-rose-800 flex items-center gap-1.5 font-medium hover:bg-rose-900"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Convoy Commander</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500 text-xs">
              Select a convoy on the left to inspect live telematics.
            </div>
          )}
        </div>
      </div>

      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        corridors={corridors}
      />
    </div>
  );
};
