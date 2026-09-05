import React, { useState } from "react";
import { 
  HighwayCorridor, 
  AlternateRouteResult,
  CargoCategory 
} from "../types";
import { 
  RefreshCw, 
  Sparkles, 
  Compass, 
  Clock, 
  Fuel, 
  Weight, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  ArrowRight,
  Truck
} from "lucide-react";

interface AlternateRouteEngineProps {
  corridors: HighwayCorridor[];
  selectedCorridor: HighwayCorridor | null;
  onSelectCorridor: (corridor: HighwayCorridor) => void;
}

export const AlternateRouteEngine: React.FC<AlternateRouteEngineProps> = ({
  corridors,
  selectedCorridor,
  onSelectCorridor,
}) => {
  const current = selectedCorridor || corridors[0];

  const [origin, setOrigin] = useState("Guwahati Multi-Modal Cargo Hub");
  const [destination, setDestination] = useState("Gangtok Logistics Depot, Sikkim");
  const [cargoType, setCargoType] = useState<CargoCategory>("MEDICINES_VACCINES");
  const [vehicleType, setVehicleType] = useState("Refrigerated 12-Ton 4x4 Cargo Van");
  
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<AlternateRouteResult | null>(null);

  const cargoOptions: { value: CargoCategory; label: string }[] = [
    { value: "MEDICINES_VACCINES", label: "Emergency Medicines, Insulin & Vaccines (Cold-Chain)" },
    { value: "PDS_FOOD_GRAINS", label: "PDS Rice & Wheat Rations (Bulk Food Logistics)" },
    { value: "POL_FUEL_TANKERS", label: "POL Petroleum & High-Speed Diesel Tankers" },
    { value: "STRATEGIC_CONSTRUCTION_BRO", label: "BRO Strategic Bridge & Road Construction Materials" },
    { value: "AGRI_HORTICULTURE", label: "High-Value Fresh Agri / Horticultural Produce Export" },
    { value: "DISASTER_RELIEF", label: "NDRF/SDRF Emergency Dewatering & Rescue Gear" },
  ];

  const handleCalculateAlternate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/suggest-alternate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockedRoute: {
            name: current.name,
            code: current.code,
            state: current.state,
            currentDisruption: current.currentDisruption,
          },
          origin,
          destination,
          cargoType,
          vehicleType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate alternate routes.");
      }
      setRouteResult(data);
    } catch (err: any) {
      console.error("Alternate route calculation error:", err);
      alert(err.message || "An unexpected error occurred while calculating alternate routes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 p-5 rounded-xl border border-blue-200/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>AI Dynamic Rerouting Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Contingency Route Optimization & Delay Estimator
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl leading-relaxed">
            When key arterial mountain lifelines (NH-10, NH-27, NH-29) suffer washouts or structural bridge limits, this engine computes viable bypass routes across secondary corridors, accounting for bridge load ratings, gradient limits, and fuel penalties.
          </p>
        </div>

        <button
          id="calculate-alternate-route-btn"
          onClick={handleCalculateAlternate}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-slate-900 font-medium text-xs flex items-center gap-2 transition-all shadow-lg shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Optimizing NER Detours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Calculate Alternate Routes</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route Inputs */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Compass className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Disrupted Route & Cargo Details</h3>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">
              Currently Obstructed Corridor:
            </label>
            <select
              id="alternate-route-corridor-select"
              value={current.id}
              onChange={(e) => {
                const c = corridors.find((item) => item.id === e.target.value);
                if (c) {
                  onSelectCorridor(c);
                  setRouteResult(null);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
            >
              {corridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} ({c.name.split("-")[0]}) - {c.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Origin Logistics Point:</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
              placeholder="e.g. Guwahati Multi-Modal Cargo Hub"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Final Destination:</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
              placeholder="e.g. Gangtok / Imphal / Aizawl"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Cargo Consignment Category:</label>
            <select
              id="cargo-type-select"
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value as CargoCategory)}
              className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
            >
              {cargoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Vehicle Classification:</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
            >
              <option value="Refrigerated 12-Ton 4x4 Cargo Van">Refrigerated 12-Ton 4x4 Cargo Van (Vaccines/Perishables)</option>
              <option value="16-Ton Medium Commercial Vehicle (2-Axle)">16-Ton Medium Commercial Vehicle (2-Axle)</option>
              <option value="25-Ton Multi-Axle Heavy Truck (3-Axle)">25-Ton Multi-Axle Heavy Truck (3-Axle)</option>
              <option value="40-Ton Heavy Trailer / Tanker">40-Ton Heavy Trailer / Tanker</option>
              <option value="Light Commercial Pickup (4x4)">Light Commercial Pickup (4x4)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCalculateAlternate}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Optimize Alternate Route Now</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Alternate Route Results */}
        <div className="lg:col-span-2 space-y-5">
          {routeResult ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Route Detour Options: {routeResult.origin} ➔ {routeResult.destination}
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Primary Route: <span className="text-rose-600 font-semibold">{routeResult.primaryRoute} (OBSTRUCTED)</span>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {routeResult.alternateRoutes.length} Feasible Bypasses Identified
                </span>
              </div>

              {/* Strategic Overall Recommendation */}
              <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-800/50 text-xs text-emerald-200 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-700">Strategic Logistics Commander Recommendation:</strong>
                  <p className="mt-0.5 text-slate-800">{routeResult.strategicRecommendation}</p>
                </div>
              </div>

              {/* Alternate Routes Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routeResult.alternateRoutes.map((alt, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 border border-slate-200 p-4 rounded-xl border border-slate-200 hover:border-indigo-500/50 transition-all space-y-3.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                          Alternate Option #{index + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{alt.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase">Feasibility</span>
                        <p className="font-bold text-blue-600 text-sm">{alt.feasibilityScore}/100</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white/80 p-2.5 rounded-lg shadow-sm border border-slate-200">
                      <div>
                        <span className="text-slate-500 text-[11px]">Extra Detour:</span>
                        <p className="text-slate-900 font-semibold">+{alt.detourDistanceKm} km</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">Est. Delay:</span>
                        <p className="text-amber-700 font-semibold">+{alt.additionalDelayHours} Hours</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">Max Weight:</span>
                        <p className="text-slate-900 font-semibold">{alt.maxVehicleWeightTons} Tons</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">Fuel Increase:</span>
                        <p className="text-rose-700 font-semibold">+{alt.fuelConsumptionIncreasePercent}%</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 text-[11px] font-medium">Key Waypoints & Crossing Points:</span>
                      <div className="flex flex-wrap gap-1">
                        {alt.keyWaypoints.map((wp, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-300 text-slate-800 text-[10px]">
                            {wp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-white/90 text-slate-700 text-[11px] shadow-sm border border-slate-200">
                      <strong>Tactical Escort & Dispatch Advisory:</strong> {alt.tacticalAdvice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50/60 border border-blue-200/50 flex items-center justify-center text-blue-600">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Alternate Route Selected</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Select your consignment category, origin, destination, and vehicle gross weight on the left panel, then click <strong>"Calculate Alternate Routes"</strong> to generate terrain-tested contingency bypasses.
                </p>
              </div>
              <button
                onClick={handleCalculateAlternate}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-slate-900 font-medium text-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calculate Bypass for {current.code}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
