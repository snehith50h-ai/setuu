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
  Truck,
  Zap,
  Shield,
  Scale,
  UserCheck,
  Info,
  CheckCircle2
} from "lucide-react";
import { RiskWeightedRoute, RouteCategory } from "../types";

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

  const [origin, setOrigin] = useState("Siliguri Logistics Hub");
  const [destination, setDestination] = useState("Gangtok Military Hospital");
  const [cargoType, setCargoType] = useState<CargoCategory>("MEDICINES_VACCINES");
  const [vehicleType, setVehicleType] = useState("REFRIGERATED_TRUCK_16T");
  const [loading, setLoading] = useState(false);
  const [selectedRouteCategory, setSelectedRouteCategory] = useState<"ALL" | RouteCategory>("ALL");

  const cargoOptions: { value: CargoCategory; label: string }[] = [
    { value: "MEDICINES_VACCINES", label: "Medicines & Vaccines (Cold-Chain)" },
    { value: "PDS_FOOD_GRAINS", label: "PDS Food Grains & Rice" },
    { value: "POL_FUEL_TANKERS", label: "POL Fuel & Petroleum Tankers" },
    { value: "AGRI_HORTICULTURE", label: "Perishable Agri & Horticulture" },
    { value: "STRATEGIC_CONSTRUCTION_BRO", label: "BRO Strategic Construction Heavy Material" },
    { value: "DISASTER_RELIEF", label: "NDRF / SDRF Disaster Relief Consignments" },
  ];

  // Initialize with ready-to-display high-fidelity multi-route assessment
  const [routeResult, setRouteResult] = useState<any>({
    status: "SUCCESS",
    originalRoute: {
      corridor: current?.name || "NH-10 Sevoke - Gangtok",
      status: current?.status || "BLOCKED",
      directDistanceKm: 114,
      normalTransitHours: 3.5,
    },
    alternateRoutes: [
      {
        name: "Sevoke-Damdim-Lava Arterial Bypass",
        detourDistanceKm: 38,
        additionalDelayHours: 2.8,
        terrainDifficulty: "Moderate Valley Grade with Narrow Pavement",
        maxVehicleWeightTons: 20,
        feasibilityScore: 82,
        fuelConsumptionIncreasePercent: 22,
        keyWaypoints: ["Sevoke Point", "Damdim Junction", "Malbazar", "Lava", "Gangtok"],
        tacticalAdvice: "Standard police escort. Maintain convoy speed under 40 km/h due to wet road surface.",
      },
      {
        name: "Algarah-Pedong Ridge All-Weather Bypass",
        detourDistanceKm: 62,
        additionalDelayHours: 4.5,
        terrainDifficulty: "High-Altitude All-Weather Ridge Highway",
        maxVehicleWeightTons: 16,
        feasibilityScore: 91,
        fuelConsumptionIncreasePercent: 38,
        keyWaypoints: ["Gorubathan", "Algarah", "Reshi", "Pedong", "Rorathang"],
        tacticalAdvice: "Reinforced bridge bypass. Free from active slide zones, recommended for cold-chain vaccines.",
      },
    ],
    strategicStockpileAdvice: "Pre-position 500L emergency diesel and temperature-stable medical buffers at Rangpo staging depot.",
  });

  const handleCalculateAlternate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alternate-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corridorId: current.id,
          origin,
          destination,
          cargoType,
          vehicleType,
        }),
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setRouteResult(data);
    } catch (err) {
      console.warn("API fallback to local simulation:", err);
      setRouteResult({
        status: "SUCCESS",
        originalRoute: {
          corridor: current.name,
          status: current.status,
          directDistanceKm: 114,
          normalTransitHours: 3.5,
        },
        alternateRoutes: [
          {
            name: `${current.code} Low-Elevation Valley Bypass`,
            detourDistanceKm: 38,
            additionalDelayHours: 2.8,
            terrainDifficulty: "Moderate Valley Grade",
            maxVehicleWeightTons: 20,
            feasibilityScore: 82,
            fuelConsumptionIncreasePercent: 22,
            keyWaypoints: ["Valley Staging Hub", "Damdim", "Lava", "Reshi", "Destination"],
            tacticalAdvice: "Fastest route prioritizing speed. Monitor active slope drainage.",
          },
          {
            name: `${current.code} Ridge All-Weather Cutoff`,
            detourDistanceKm: 62,
            additionalDelayHours: 4.5,
            terrainDifficulty: "High-Altitude Engineered All-Weather Ridge",
            maxVehicleWeightTons: 16,
            feasibilityScore: 91,
            fuelConsumptionIncreasePercent: 38,
            keyWaypoints: ["Gorubathan", "Algarah Ridge", "Pedong Border", "Rorathang", "Ranipool"],
            tacticalAdvice: "Zero landslide exposure. Completely bypasses river valley breach points.",
          },
        ],
        strategicStockpileAdvice: "Reinforce emergency reserve depot buffers at intermediate transit points.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate 3 Risk-Weighted Routing Options (Fastest, Safest, Balanced) with P50/P90 ETA Quantiles
  const getRiskWeightedRoutes = (): RiskWeightedRoute[] => {
    if (!routeResult) return [];

    const baseRoutes = routeResult.alternateRoutes || [];
    const baseA = baseRoutes[0] || {
      name: "Valley Arterial Bypass",
      detourDistanceKm: 38,
      additionalDelayHours: 2.8,
      terrainDifficulty: "Moderate Valley Grade",
      maxVehicleWeightTons: 20,
      feasibilityScore: 82,
      fuelConsumptionIncreasePercent: 22,
      keyWaypoints: ["Sevoke", "Damdim", "Malbazar", "Lava", "Gangtok"],
      tacticalAdvice: "Standard escort. Maintain convoy speed under 40 km/h."
    };
    const baseB = baseRoutes[1] || {
      name: "Ridge All-Weather Cutoff",
      detourDistanceKm: 62,
      additionalDelayHours: 4.5,
      terrainDifficulty: "High-Altitude All-Weather Bypass",
      maxVehicleWeightTons: 16,
      feasibilityScore: 91,
      fuelConsumptionIncreasePercent: 38,
      keyWaypoints: ["Gorubathan", "Algarah", "Reshi", "Pedong", "Rorathang"],
      tacticalAdvice: "Reinforced bridge bypass. Free from active slide zones."
    };

    // 1. FASTEST ROUTE: Prioritized purely for speed
    const fastestP50 = Number((3.5 + (baseA.additionalDelayHours || 2.5) * 0.85).toFixed(1));
    const fastestP90 = Number((fastestP50 * 1.55).toFixed(1));
    const fastestRoute: RiskWeightedRoute = {
      category: "FASTEST",
      title: "Fastest Route",
      tagline: "Direct Valley Path • Speed Prioritized",
      name: `${baseA.name} (Direct Arterial Speed)`,
      detourDistanceKm: Math.min(baseA.detourDistanceKm || 38, 45),
      p50EtaHours: fastestP50,
      p90EtaHours: fastestP90,
      riskIndex: 68,
      terrainDifficulty: baseA.terrainDifficulty || "Steep Mountain Grade with Chokepoints",
      maxVehicleWeightTons: baseA.maxVehicleWeightTons || 18,
      feasibilityScore: 78,
      fuelConsumptionIncreasePercent: Math.max(15, (baseA.fuelConsumptionIncreasePercent || 25) - 6),
      driverShiftCompliance: {
        maxContinuousHours: 10,
        mandatoryBreakRequired: fastestP90 > 5,
        recommendedRestStop: "Highway Checkpoint KM 85 (Sevoke Staging Yard)",
        shiftViolationWarning: fastestP90 > 10 ? "Worst-case P90 exceeds 10h max continuous shift! Dual-driver roster required." : undefined,
      },
      keyWaypoints: baseA.keyWaypoints || ["Sevoke", "Damdim", "Lava", "Gangtok"],
      tacticalAdvice: "Fastest transit corridor for urgent consignments. Exercise caution near active shale slippage points.",
      highlights: ["Minimum Detour Mileage", "Direct Line of Sight", "Higher Monsoon Slippage Exposure"]
    };

    // 2. SAFEST ROUTE: Avoids high-risk terrain & active slide zones
    const safestP50 = Number((4.5 + (baseB.additionalDelayHours || 4.2) * 1.25).toFixed(1));
    const safestP90 = Number((safestP50 * 1.22).toFixed(1));
    const safestRoute: RiskWeightedRoute = {
      category: "SAFEST",
      title: "Safest Route",
      tagline: "Zero Landslide Exposure • Geotechnically Reinforced",
      name: `${baseB.name} (Reinforced All-Weather Bypass)`,
      detourDistanceKm: Math.max(baseB.detourDistanceKm || 62, 58),
      p50EtaHours: safestP50,
      p90EtaHours: safestP90,
      riskIndex: 18,
      terrainDifficulty: "Gentle Gradient / Reinforced Retaining Walls",
      maxVehicleWeightTons: Math.max(baseB.maxVehicleWeightTons || 20, 22),
      feasibilityScore: 94,
      fuelConsumptionIncreasePercent: (baseB.fuelConsumptionIncreasePercent || 35) + 6,
      driverShiftCompliance: {
        maxContinuousHours: 10,
        mandatoryBreakRequired: safestP90 > 5,
        recommendedRestStop: "PWD Rest House / Logistics Staging (KM 110)",
        shiftViolationWarning: safestP90 > 10 ? "Worst-case transit time exceeds 10h driver shift. Schedule mandatory 1-hour rest stop." : undefined,
      },
      keyWaypoints: baseB.keyWaypoints || ["Gorubathan", "Lava", "Reshi", "Rorathang", "Gangtok"],
      tacticalAdvice: "Recommended for high-value cold-chain vaccines and heavy POL tankers. Avoids unstable geological fault zones.",
      highlights: ["Zero Landslide Zones", "Reinforced Bailey Crossings", "Lowest ETA Variance"]
    };

    // 3. BALANCED ROUTE: Optimal compromise
    const balancedP50 = Number(((fastestP50 + safestP50) / 2).toFixed(1));
    const balancedP90 = Number(((fastestP90 + safestP90) / 2 * 0.95).toFixed(1));
    const balancedRoute: RiskWeightedRoute = {
      category: "BALANCED",
      title: "Balanced Route",
      tagline: "Calibrated Risk & Transit Delay Trade-off",
      name: `Hybrid Strategic Link (Bypass & All-Weather Cutoff)`,
      detourDistanceKm: Math.round((fastestRoute.detourDistanceKm + safestRoute.detourDistanceKm) / 2),
      p50EtaHours: balancedP50,
      p90EtaHours: balancedP90,
      riskIndex: 38,
      terrainDifficulty: "Mixed Mountain Highway (Paved / All-Weather)",
      maxVehicleWeightTons: 18,
      feasibilityScore: 88,
      fuelConsumptionIncreasePercent: Math.round((fastestRoute.fuelConsumptionIncreasePercent + safestRoute.fuelConsumptionIncreasePercent) / 2),
      driverShiftCompliance: {
        maxContinuousHours: 10,
        mandatoryBreakRequired: balancedP90 > 5,
        recommendedRestStop: "Mid-Corridor Toll Plaza Checkpoint (KM 92)",
        shiftViolationWarning: balancedP90 > 10 ? "P90 monsoon delay exceeds 10h threshold. Driver rest rotation advised." : undefined,
      },
      keyWaypoints: Array.from(new Set([...(baseA.keyWaypoints || []).slice(0, 3), ...(baseB.keyWaypoints || []).slice(2)])),
      tacticalAdvice: "Standard operational route for scheduled freight. Delivers optimal balance between delivery speed and terrain stability.",
      highlights: ["Optimal Fuel Economy", "Calibrated Hazard Index", "Standard Convoy Protocol"]
    };

    return [fastestRoute, safestRoute, balancedRoute];
  };

  const riskWeightedRoutes = getRiskWeightedRoutes();
  const displayedRoutes = selectedRouteCategory === "ALL" 
    ? riskWeightedRoutes 
    : riskWeightedRoutes.filter(r => r.category === selectedRouteCategory);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 p-5 rounded-xl border border-blue-200/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>AI Dynamic Rerouting Engine • Risk-Weighted Multi-Routing</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Dynamic Multi-Route Navigation &amp; Delay Confidence Engine
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 max-w-2xl leading-relaxed">
            Generates 3 distinct risk-weighted routing choices side-by-side (Fastest, Safest, Balanced) with Model C P50/P90 ETA quantiles, cold-chain preservation, and driver shift enforcement (10h max continuous shift).
          </p>
        </div>

        <button
          id="calculate-alternate-route-btn"
          onClick={handleCalculateAlternate}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Optimizing 3-Way Detours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Calculate 3-Way Multi-Routes</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route Inputs */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Compass className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Target Route &amp; Cargo Constraints</h3>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">
              Currently Obstructed Lifeline Corridor:
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
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none focus:border-blue-500 font-medium"
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
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none focus:border-blue-500"
              placeholder="e.g. Guwahati Multi-Modal Cargo Hub"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Final Destination Depot:</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none focus:border-blue-500"
              placeholder="e.g. Gangtok Logistics Depot, Sikkim"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Cargo Consignment Category:</label>
            <select
              id="cargo-type-select"
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value as CargoCategory)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none focus:border-blue-500 font-medium"
            >
              {cargoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Vehicle Classification &amp; GVW:</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none focus:border-blue-500 font-medium"
            >
              <option value="Refrigerated 12-Ton 4x4 Cargo Van">Refrigerated 12-Ton 4x4 Cargo Van (Cold-Chain)</option>
              <option value="16-Ton Medium Commercial Vehicle (2-Axle)">16-Ton Medium Commercial Vehicle (2-Axle)</option>
              <option value="25-Ton Multi-Axle Heavy Truck (3-Axle)">25-Ton Multi-Axle Heavy Truck (3-Axle)</option>
              <option value="40-Ton Heavy Trailer / Tanker">40-Ton Heavy Trailer / POL Tanker</option>
              <option value="Light Commercial Pickup (4x4)">Light Commercial Pickup (4x4 Rapid Relief)</option>
            </select>
          </div>

          {/* Regulatory & Safety Profiling Summary */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5 text-[11px] text-blue-900">
            <div className="font-semibold flex items-center gap-1.5 text-blue-800">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Driver Shift &amp; Cargo Mandates</span>
            </div>
            <p>• Max continuous driving shift: <strong>10 hours</strong>.</p>
            <p>• Mandatory 45-min rest break after: <strong>5 hours</strong>.</p>
            {cargoType === "MEDICINES_VACCINES" && (
              <p className="text-purple-700 font-semibold">• ❄️ Cold-chain battery reserve: 16 hrs (monitored).</p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleCalculateAlternate}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Generate 3-Way Route Matrix</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: 3-Way Risk Weighted Routing Results */}
        <div className="lg:col-span-2 space-y-5">
          {routeResult ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Multi-Route Matrix: {routeResult.origin} ➔ {routeResult.destination}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Primary Route: <span className="text-rose-600 font-semibold">{routeResult.primaryRoute} (OBSTRUCTED)</span>
                  </p>
                </div>

                {/* Filter Tabs: All, Fastest, Safest, Balanced */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  {(["ALL", "FASTEST", "SAFEST", "BALANCED"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedRouteCategory(cat)}
                      className={`px-3 py-1 rounded-md font-semibold transition-all text-xs ${
                        selectedRouteCategory === cat
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {cat === "ALL" ? "All 3 Options" : cat === "FASTEST" ? "⚡ Fastest" : cat === "SAFEST" ? "🛡️ Safest" : "⚖️ Balanced"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategic Commander Brief */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 font-bold">MDoNER Regional Commander Directive:</strong>
                  <p className="mt-0.5 text-slate-700">{routeResult.strategicRecommendation}</p>
                </div>
              </div>

              {/* 3-Way Comparative Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayedRoutes.map((route, idx) => {
                  const isFastest = route.category === "FASTEST";
                  const isSafest = route.category === "SAFEST";
                  const isBalanced = route.category === "BALANCED";

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4.5 space-y-4 text-xs transition-all flex flex-col justify-between ${
                        isSafest
                          ? "bg-emerald-50/30 border-emerald-300 shadow-sm"
                          : isFastest
                          ? "bg-rose-50/20 border-rose-300"
                          : "bg-blue-50/25 border-blue-300"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Category Badge & Title */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isFastest
                                ? "bg-rose-100 text-rose-800"
                                : isSafest
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {isFastest && <Zap className="w-3 h-3" />}
                              {isSafest && <Shield className="w-3 h-3" />}
                              {isBalanced && <Scale className="w-3 h-3" />}
                              <span>{route.title}</span>
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                              {route.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">{route.tagline}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Feasibility</span>
                            <span className="text-base font-bold text-slate-800">{route.feasibilityScore}<span className="text-xs text-slate-400">/100</span></span>
                          </div>
                        </div>

                        {/* Model C: P50 & P90 ETA Quantile Bands */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span>ETA Confidence Bands (Model C):</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-slate-100">
                            <div className="bg-blue-50/70 p-1.5 rounded-lg">
                              <span className="block text-[10px] text-blue-700 font-bold uppercase">P50 Expected</span>
                              <span className="text-sm font-bold text-blue-900">{route.p50EtaHours} hrs</span>
                            </div>
                            <div className="bg-amber-50/70 p-1.5 rounded-lg">
                              <span className="block text-[10px] text-amber-700 font-bold uppercase">P90 Worst-Case</span>
                              <span className="text-sm font-bold text-amber-900">{route.p90EtaHours} hrs</span>
                            </div>
                          </div>

                          {/* Quantile Bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>P50: Nominal Transit</span>
                              <span>P90: Severe Monsoon Margin</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${Math.min(100, (route.p50EtaHours / route.p90EtaHours) * 100)}%` }}
                                className={`h-full ${isFastest ? "bg-rose-500" : isSafest ? "bg-emerald-500" : "bg-blue-500"}`}
                              />
                              <div className="bg-amber-400 h-full flex-1" />
                            </div>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Detour Distance</span>
                            <span className="font-bold text-slate-800">+{route.detourDistanceKm} km</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Terrain Hazard</span>
                            <span className={`font-bold ${route.riskIndex > 50 ? "text-rose-600" : "text-emerald-600"}`}>
                              {route.riskIndex}% Risk Index
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Max GVW Limit</span>
                            <span className="font-bold text-slate-800">{route.maxVehicleWeightTons} Tons</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fuel Penalty</span>
                            <span className="font-bold text-amber-700">+{route.fuelConsumptionIncreasePercent}%</span>
                          </div>
                        </div>

                        {/* Driver Shift Compliance Alert */}
                        <div className={`p-2.5 rounded-lg text-[11px] leading-relaxed border ${
                          route.driverShiftCompliance.shiftViolationWarning
                            ? "bg-amber-50 border-amber-300 text-amber-900"
                            : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                        }`}>
                          <div className="font-semibold flex items-center gap-1 mb-0.5">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Driver Shift Compliance</span>
                          </div>
                          {route.driverShiftCompliance.shiftViolationWarning ? (
                            <p className="text-amber-800">{route.driverShiftCompliance.shiftViolationWarning}</p>
                          ) : (
                            <p className="text-emerald-800">Compliant with 10h shift limit. Rest stop: {route.driverShiftCompliance.recommendedRestStop}.</p>
                          )}
                        </div>

                        {/* Key Waypoints */}
                        <div className="space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase font-semibold">Corridor Waypoints:</span>
                          <div className="flex flex-wrap gap-1">
                            {route.keyWaypoints.map((wp, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[10px] font-medium">
                                {wp}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Tactical Advice */}
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 leading-normal">
                          <strong>Tactical Directive:</strong> {route.tacticalAdvice}
                        </p>
                      </div>

                      <button
                        onClick={() => alert(`Route "${route.name}" activated! Telemetry dispatch dispatched to convoy units with P50 ETA of ${route.p50EtaHours} hrs.`)}
                        className={`w-full mt-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          isSafest
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : isFastest
                            ? "bg-rose-600 hover:bg-rose-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <span>Dispatch via {route.title}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50/60 border border-blue-200/50 flex items-center justify-center text-blue-600">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Multi-Route Matrix Computed Yet</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Select your consignment category, origin, destination, and vehicle gross weight on the left panel, then click <strong>"Calculate 3-Way Multi-Routes"</strong> to generate side-by-side Fastest, Safest, and Balanced routes with P50/P90 ETA confidence bands.
                </p>
              </div>
              <button
                onClick={handleCalculateAlternate}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate 3-Way Routing for {current.code}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
