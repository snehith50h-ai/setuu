import React, { useState } from "react";
import { 
  HighwayCorridor, 
  DisruptionPredictionResult 
} from "../types";
import { 
  ShieldAlert, 
  Sparkles, 
  CloudRain, 
  Activity, 
  TrendingUp, 
  Wrench, 
  CheckCircle2, 
  AlertOctagon, 
  Sliders, 
  Clock, 
  Compass, 
  ArrowRight
} from "lucide-react";

interface DisruptionPredictorProps {
  corridors: HighwayCorridor[];
  selectedCorridor: HighwayCorridor | null;
  onSelectCorridor: (corridor: HighwayCorridor) => void;
  onNavigateToAlternateRoutes: (corridor: HighwayCorridor) => void;
}

export const DisruptionPredictor: React.FC<DisruptionPredictorProps> = ({
  corridors,
  selectedCorridor,
  onSelectCorridor,
  onNavigateToAlternateRoutes,
}) => {
  const current = selectedCorridor || corridors[0];

  // Configurable Environmental Telemetry for AI Simulation
  const [rainfall24h, setRainfall24h] = useState(current?.environmentalMetrics.rainfall24h || 95);
  const [rainfall72h, setRainfall72h] = useState(current?.environmentalMetrics.rainfall72h || 240);
  const [soilSaturation, setSoilSaturation] = useState(current?.environmentalMetrics.soilSaturation || 85);
  const [slopeIncline, setSlopeIncline] = useState(current?.environmentalMetrics.slopeInclineDegrees || 45);
  
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<DisruptionPredictionResult | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Peak disruption probability
  const peakProbability = prediction?.disruptionProbability ?? (
    current?.environmentalMetrics?.hazardIndex 
      ? Math.min(94, Math.max(70, current.environmentalMetrics.hazardIndex + 8))
      : 88
  );

  // 72-Hour Horizon timeline milestones
  const horizonPoints = [
    { label: "-24h", fullLabel: "24 Hours Ago", x: 75, multiplier: 0.16, rainfallDesc: "Antecedent saturation" },
    { label: "-12h", fullLabel: "12 Hours Ago", x: 165, multiplier: 0.35, rainfallDesc: "Precipitation intensifying" },
    { label: "Now", fullLabel: "Current Peak Storm", x: 265, multiplier: 1.0, rainfallDesc: "Peak pore-pressure hazard" },
    { label: "+12h", fullLabel: "+12 Hours Ahead", x: 365, multiplier: 0.94, rainfallDesc: "Severe residual slope stress" },
    { label: "+24h", fullLabel: "+24 Hours Ahead", x: 465, multiplier: 0.78, rainfallDesc: "Gradual stabilization" },
    { label: "+48h", fullLabel: "+48 Hours Ahead", x: 555, multiplier: 0.48, rainfallDesc: "Receding flood line" },
    { label: "+72h", fullLabel: "+72 Hours Ahead", x: 645, multiplier: 0.28, rainfallDesc: "Normal corridor flow" },
  ].map((pt) => {
    const prob = Math.min(98, Math.max(5, Math.round(peakProbability * pt.multiplier)));
    const y = 195 - (prob / 100) * (195 - 25);
    return { ...pt, prob, y };
  });

  // Generate smooth cubic bezier path for curve and area
  const getCubicPath = () => {
    let d = `M ${horizonPoints[0].x} ${horizonPoints[0].y}`;
    for (let i = 0; i < horizonPoints.length - 1; i++) {
      const p0 = horizonPoints[i === 0 ? 0 : i - 1];
      const p1 = horizonPoints[i];
      const p2 = horizonPoints[i + 1];
      const p3 = horizonPoints[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const curveLinePath = getCubicPath();
  const curveAreaPath = `${curveLinePath} L ${horizonPoints[horizonPoints.length - 1].x} 195 L ${horizonPoints[0].x} 195 Z`;

  const handleCorridorChange = (corridorId: string) => {
    const c = corridors.find((item) => item.id === corridorId);
    if (c) {
      onSelectCorridor(c);
      setRainfall24h(c.environmentalMetrics.rainfall24h);
      setRainfall72h(c.environmentalMetrics.rainfall72h);
      setSoilSaturation(c.environmentalMetrics.soilSaturation);
      setSlopeIncline(c.environmentalMetrics.slopeInclineDegrees);
      setPrediction(null);
    }
  };

  const handleRunPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/predict-disruption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corridorName: current.name,
          state: current.state,
          coordinates: current.centerCoordinates,
          roadElevation: current.elevationProfile,
          weatherMetrics: {
            rainfall24h,
            rainfall72h,
            soilSaturation,
            slopeIncline: `${slopeIncline} degrees steep mountainous grade`,
            streamProximity: "Adjacent to seasonal mountain gorge and runoff channels",
          },
          historicalIncidents: current.currentDisruption?.description || "Monsoon erosion and slope slippage zones",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to predict disruption. Please try again.");
      }
      setPrediction(data);
    } catch (err: any) {
      console.error("Prediction error:", err);
      alert(err.message || "An unexpected error occurred while running the AI model.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 p-5 rounded-xl border border-purple-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>AI Predictive Logistics Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Pre-Disruption Vulnerability & Hazard Forecast
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl leading-relaxed">
            Evaluates precipitation thresholds, geotechnical soil moisture saturation, elevation contours, and historical slippage records across North Eastern highways to anticipate blockages before they occur.
          </p>
        </div>

        <button
          id="run-gemini-prediction-btn"
          onClick={handleRunPrediction}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-slate-900 font-medium text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              <span>Analyzing Terrain Geodata...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run AI Disruption Analysis</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Corridor Selection & Environmental Sliders */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Compass className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Target Highway Corridor</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Select Strategic Highway:
            </label>
            <select
              id="disruption-corridor-select"
              value={current.id}
              onChange={(e) => handleCorridorChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
            >
              {corridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.state} ({c.name.split("-")[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Lifeline Corridor:</span>
              <span className="text-slate-800 font-medium">{current.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">State:</span>
              <span className="text-slate-800">{current.state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Connecting Hubs:</span>
              <span className="text-slate-700">{current.startPoint} ➔ {current.endPoint}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Elevation Profile:</span>
              <span className="text-blue-700 font-medium">{current.elevationProfile}</span>
            </div>
          </div>
          
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm text-blue-900 leading-relaxed text-center">
            The AI Predictive Engine will now automatically assess the real-time terrain, calculate expected severe monsoon inputs, and predict infrastructure failures for this specific region.
          </div>
        </div>

        {/* Right 2 Columns: AI Prediction Output Display */}
        <div className="lg:col-span-2 space-y-5">
          {prediction ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6 animate-in fade-in">
              {/* Header with Risk Level */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Prediction for:</span>
                    <span className="font-bold text-slate-800 text-sm">{prediction.corridorName}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">Impact Window: <strong className="text-slate-800">{prediction.expectedImpactWindow}</strong></p>
                </div>
                <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${
                  prediction.riskLevel === "CRITICAL"
                    ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                    : prediction.riskLevel === "HIGH"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  <AlertOctagon className="w-5 h-5" />
                  <span className="font-bold text-sm tracking-wide">{prediction.riskLevel} RISK</span>
                </div>
              </div>

              {/* Inferred Environmental Metrics */}
              {prediction.inferredEnvironment && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 mb-6">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    AI Inferred Environmental Scenario
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase mb-0.5">24h Rainfall</span>
                      <span className="font-semibold text-blue-700">{prediction.inferredEnvironment.rainfall24h} mm</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase mb-0.5">72h Rainfall</span>
                      <span className="font-semibold text-blue-700">{prediction.inferredEnvironment.rainfall72h} mm</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase mb-0.5">Soil Saturation</span>
                      <span className="font-semibold text-amber-700">{prediction.inferredEnvironment.soilSaturationPercent}%</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase mb-0.5">Slope Incline</span>
                      <span className="font-semibold text-purple-700">{prediction.inferredEnvironment.slopeInclineDegrees}°</span>
                    </div>
                  </div>
                  {prediction.inferredEnvironment.terrainNotes && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700">
                      <strong>Terrain Notes:</strong> {prediction.inferredEnvironment.terrainNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Strategic Brief */}
              {prediction.strategicBrief && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">AI Strategic Assessment</span>
                  <p className="text-slate-800 text-sm leading-relaxed">{prediction.strategicBrief}</p>
                </div>
              )}

              {/* Probable Causes & Clearance Estimate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                <div className="space-y-3">
                  <h4 className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                    <span>Primary Disruption Triggers</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-800">
                    {prediction.probableCauses.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Clearing & Restoration Horizon</span>
                  </h4>
                  <p className="text-blue-700 text-sm font-semibold">{prediction.clearingTimeEstimate}</p>
                  <p className="text-slate-500 text-[11px]">
                    Model Confidence: <strong className="text-slate-700">{(prediction.confidenceScore * 100).toFixed(0)}%</strong> based on elevation gradients and historic telemetry.
                  </p>
                </div>
              </div>

              {/* Preventative Mitigation Directives */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mandatory Logistics Staging & Preventive Directives</span>
                </h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {prediction.mitigationMeasures.map((measure, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-white/60 p-2.5 rounded shadow-sm border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-800">{measure}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Jump to Alternate Route Calculation */}
              <div className="pt-2 flex justify-end">
                <button
                  id="disruption-goto-alternate-route-btn"
                  onClick={() => onNavigateToAlternateRoutes(current)}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md shadow-sm"
                >
                  <span>Compute Contingency Alternate Routes for this Corridor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Blank state prompting to run prediction */
            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-50/60 border border-purple-100 flex items-center justify-center text-purple-600">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Disruption Forecast Run Yet</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Select a corridor on the left, tune rainfall and soil saturation parameters, and click <strong>"Run AI Disruption Analysis"</strong> to generate predictive landslide, flood, and bottleneck assessments.
                </p>
              </div>
              <button
                onClick={handleRunPrediction}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-70"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate Analysis for {current.code}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Disruption Probability Forecast (72-Hour Horizon) & Contingency Rerouting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1">
        {/* Disruption Probability Forecast (72-Hour Horizon) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                Disruption Probability Forecast (72-Hour Horizon)
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Precipitation-duration threshold modeling &amp; slope stability projection
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 font-medium">
              P(Failure) Threshold: 0.50
            </span>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg
              viewBox="0 0 700 240"
              className="w-full h-auto select-none overflow-visible"
            >
              <defs>
                <linearGradient id="disruptionCurveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#f87171" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines & Y-axis labels */}
              {[
                { label: "100% -", y: 25 },
                { label: "75% -", y: 67.5 },
                { label: "50% -", y: 110 },
                { label: "25% -", y: 152.5 },
                { label: "0% -", y: 195 },
              ].map((grid, idx) => (
                <g key={idx}>
                  <line
                    x1="65"
                    y1={grid.y}
                    x2="655"
                    y2={grid.y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x="60"
                    y={grid.y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {grid.label}
                  </text>
                </g>
              ))}

              {/* Warning Threshold Line (50%) */}
              <line
                x1="65"
                y1="110"
                x2="655"
                y2="110"
                stroke="#fb923c"
                strokeWidth="1.2"
                strokeDasharray="5 4"
              />
              <text
                x="650"
                y="105"
                textAnchor="end"
                fill="#ea580c"
                fontSize="10"
                fontWeight="500"
              >
                Warning Threshold (50%)
              </text>

              {/* Area fill */}
              <path d={curveAreaPath} fill="url(#disruptionCurveGrad)" />

              {/* Main curve line */}
              <path
                d={curveLinePath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* X-Axis timeline labels & interactive hover targets */}
              {horizonPoints.map((pt, idx) => {
                const isHovered = hoveredPoint === idx;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Invisible hover target column */}
                    <rect
                      x={pt.x - 30}
                      y={20}
                      width="60"
                      height="185"
                      fill="transparent"
                    />

                    {/* Timeline tick label */}
                    <text
                      x={pt.x}
                      y="218"
                      textAnchor="middle"
                      fill={isHovered ? "#0f172a" : pt.label === "Now" ? "#334155" : "#94a3b8"}
                      fontWeight={pt.label === "Now" || isHovered ? "bold" : "normal"}
                      fontSize="11"
                    >
                      {pt.label}
                    </text>

                    {/* Circle marker on curve */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : pt.label === "Now" ? 4.5 : 3.5}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2.5 : 2}
                      className="transition-all duration-150"
                    />

                    {/* Active hover vertical guideline */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={pt.y}
                        x2={pt.x}
                        y2={195}
                        stroke="#ef4444"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint !== null && (
              <div
                className="absolute pointer-events-none bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 transition-all transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(horizonPoints[hoveredPoint].x / 700) * 100}%`,
                  top: `${(horizonPoints[hoveredPoint].y / 240) * 100}%`,
                  marginTop: "-12px",
                }}
              >
                <div className="font-semibold text-slate-200">
                  {horizonPoints[hoveredPoint].fullLabel}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-rose-400 font-bold">
                    {horizonPoints[hoveredPoint].prob}% Probability
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    ({horizonPoints[hoveredPoint].rainfallDesc})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contingency Rerouting Callout Banner */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col justify-between shadow-sm">
          <p className="text-sm text-blue-50 leading-relaxed font-normal">
            If <span className="font-semibold text-white">{current.code}</span> is compromised by monsoon failures, trigger the contingency rerouting engine to evaluate bypasses, riverine ferries, and Bailey bridge corridors.
          </p>
          <button
            id="calculate-alternate-routes-btn"
            onClick={() => onNavigateToAlternateRoutes(current)}
            className="mt-6 w-full py-3 px-4 bg-white hover:bg-blue-50 text-blue-600 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all group"
          >
            <span>Calculate Alternate Routes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
