import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { 
  HighwayCorridor, 
  StrategicBridgeOrTunnel, 
  TrackedVehicle, 
  FieldIncidentReport,
  CorridorStatus,
  CargoCategory,
  Warehouse
} from "../types";
import { 
  Layers, 
  MapPin, 
  Truck, 
  AlertTriangle, 
  ShieldCheck, 
  Maximize2, 
  Compass, 
  Sparkles, 
  Clock, 
  ExternalLink,
  ChevronRight,
  X,
  Warehouse as WarehouseIcon,
  Snowflake,
  Box
} from "lucide-react";

interface GISMapProps {
  corridors: HighwayCorridor[];
  warehouses?: Warehouse[];
  bridges: StrategicBridgeOrTunnel[];
  vehicles: TrackedVehicle[];
  incidents: FieldIncidentReport[];
  selectedCorridor: HighwayCorridor | null;
  onSelectCorridor: (corridor: HighwayCorridor) => void;
  onSelectVehicle: (vehicle: TrackedVehicle) => void;
  onSelectIncident: (incident: FieldIncidentReport) => void;
  onTriggerDisruptionAnalysis: (corridor: HighwayCorridor) => void;
  onTriggerAlternateRoute: (corridor: HighwayCorridor) => void;
  detailedRoutes: Record<string, {lat: number, lng: number}[]>;
}

export const GISMap: React.FC<GISMapProps> = ({
  corridors,
  warehouses = [],
  bridges,
  vehicles,
  incidents,
  selectedCorridor,
  onSelectCorridor,
  onSelectVehicle,
  onSelectIncident,
  onTriggerDisruptionAnalysis,
  onTriggerAlternateRoute,
  detailedRoutes,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer Toggles
  const [showCorridors, setShowCorridors] = useState(true);
  const [showBridges, setShowBridges] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showHazardHeatmap, setShowHazardHeatmap] = useState(true);
  const [showWarehouses, setShowWarehouses] = useState(true);
  const [tileLayerType, setTileLayerType] = useState<"topo" | "standard" | "satellite">("standard");

  // Selected item modal/drawer inside GIS
  const [activeItem, setActiveItem] = useState<{
    type: "corridor" | "bridge" | "vehicle" | "incident" | "warehouse";
    data: any;
  } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center over North East India (latitude: 26.2, longitude: 92.8, zoom: 7)
    const map = L.map(mapContainerRef.current, {
      center: [26.2, 92.8],
      zoom: 7,
      minZoom: 6,
      maxZoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Default Carto Dark Matter layer for high-contrast logistics intelligence
    const standardTiles = L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: "&copy; OpenStreetMap contributors &copy; CARTOcopy; Google Maps",
      maxZoom: 19,
    }).addTo(map);

    (map as any)._baseTileLayer = standardTiles;

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if ((map as any)._baseTileLayer) {
      map.removeLayer((map as any)._baseTileLayer);
    }

    let newTileLayer: L.TileLayer;
    if (tileLayerType === "topo") {
      newTileLayer = L.tileLayer("https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
        attribution: "Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMapcopy; Google Maps",
        maxZoom: 16,
      });
    } else if (tileLayerType === "satellite") {
      newTileLayer = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        attribution: "Tiles &copy; Esri, Earthstar Geographicscopy; Google Maps",
        maxZoom: 18,
      });
    } else {
      newTileLayer = L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: "&copy; OpenStreetMap &copy; CARTOcopy; Google Maps",
        maxZoom: 19,
      });
    }

    newTileLayer.addTo(map);
    (map as any)._baseTileLayer = newTileLayer;
  }, [tileLayerType]);

  // Render Map Features (Corridors, Bridges, Vehicles, Incidents)
  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    // 1. Render Corridors (Highways)
    if (showCorridors) {
      corridors.forEach((c) => {
        const pathCoords = detailedRoutes[c.code] && detailedRoutes[c.code].length > 0 ? detailedRoutes[c.code] : c.coordinatesPath;
        const latLngs = pathCoords.map((pt) => [pt.lat, pt.lng] as [number, number]);

        let color = "#10b981"; // OPEN = Green
        let dashArray: string | undefined = undefined;
        let weight = 5;

        if (c.status === "BLOCKED") {
          color = "#ef4444"; // Red
          weight = 6;
          dashArray = "6, 8";
        } else if (c.status === "HIGH_RISK") {
          color = "#f97316"; // Orange
          weight = 5;
        } else if (c.status === "RESTRICTED") {
          color = "#eab308"; // Amber
          weight = 5;
          dashArray = "4, 4";
        }

        const polyline = L.polyline(latLngs, {
          color,
          weight,
          dashArray,
          opacity: 0.9,
        }).addTo(layerGroup);

        polyline.on("click", () => {
          onSelectCorridor(c);
          setActiveItem({ type: "corridor", data: c });
        });

        // Add Center Marker
        const corridorIcon = L.divIcon({
          className: "custom-corridor-icon",
          html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #0f172a; box-shadow: 0 0 10px ${color};">${c.code.replace("NH-", "")}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const centerMarker = L.marker([c.centerCoordinates.lat, c.centerCoordinates.lng], {
          icon: corridorIcon,
        }).addTo(layerGroup);

        centerMarker.bindTooltip(`<b>${c.name}</b><br/>Status: ${c.status}`, {
          direction: "top",
          className: "gis-tooltip",
        });

        centerMarker.on("click", () => {
          onSelectCorridor(c);
          setActiveItem({ type: "corridor", data: c });
        });
      });
    }

    // 2. Render Strategic Bridges & Tunnels
    if (showBridges) {
      bridges.forEach((b) => {
        const iconColor = b.status === "OPEN" ? "#38bdf8" : "#f59e0b";
        const symbol = b.type === "TUNNEL" ? "🚇" : "🌉";

        const bridgeIcon = L.divIcon({
          className: "custom-bridge-icon",
          html: `<div style="background: rgba(15, 23, 42, 0.9); border: 2px solid ${iconColor}; padding: 3px 6px; border-radius: 6px; font-size: 11px; display: flex; align-items: center; gap: 3px; color: #e2e8f0; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.5); white-space: nowrap;">
            <span>${symbol}</span>
            <span>${b.name.split(" ")[0]}</span>
          </div>`,
          iconSize: [80, 26],
          iconAnchor: [40, 13],
        });

        const marker = L.marker([b.coordinates.lat, b.coordinates.lng], {
          icon: bridgeIcon,
        }).addTo(layerGroup);

        marker.on("click", () => {
          setActiveItem({ type: "bridge", data: b });
        });
      });
    }

    // 4. Render Warehouses & Cold Storage
    if (showWarehouses) {
      warehouses.forEach((w) => {
        const isColdStorage = w.type === "COLD_STORAGE";
        const iconBg = isColdStorage ? "#eff6ff" : "#f8fafc";
        const iconColor = isColdStorage ? "#3b82f6" : "#64748b";
        const iconBorder = isColdStorage ? "#bfdbfe" : "#e2e8f0";
        const emoji = isColdStorage ? "❄️" : "📦";

        const whIcon = L.divIcon({
          className: "custom-warehouse-icon",
          html: `<div style="background: ${iconBg}; border: 2px solid ${iconBorder}; border-radius: 8px; padding: 4px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
            <div style="font-size: 16px;">${emoji}</div>
            <div style="font-size: 8px; font-weight: bold; color: ${iconColor}; margin-top: 2px;">${w.type === 'MULTI_MODAL_HUB' ? 'HUB' : w.capacityTons + 'T'}</div>
          </div>`,
          iconSize: [36, 42],
          iconAnchor: [18, 21],
        });

        const m = L.marker([w.coordinates.lat, w.coordinates.lng], { icon: whIcon })
          .addTo(layerGroupRef.current!)
          .on("click", () => {
            setActiveItem({ type: "warehouse", data: w });
          });
      });
    }

    // 5. Render Live GPS Vehicles
    if (showVehicles) {
      vehicles.forEach((v) => {
        const cargoIcons: Record<CargoCategory, string> = {
          MEDICINES_VACCINES: "💊",
          PDS_FOOD_GRAINS: "🍚",
          POL_FUEL_TANKERS: "⛽",
          AGRI_HORTICULTURE: "🍍",
          STRATEGIC_CONSTRUCTION_BRO: "🏗️",
          DISASTER_RELIEF: "⚡",
        };

        const statusBorder = 
          v.status === "ON_TRACK" ? "#10b981" : 
          v.status === "DELAYED" ? "#f59e0b" : 
          v.status === "REROUTED" ? "#8b5cf6" : "#ef4444";

        const vehicleIcon = L.divIcon({
          className: "custom-vehicle-icon",
          html: `<div style="position: relative; background: #0f172a; border: 2px solid ${statusBorder}; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 0 12px ${statusBorder}80;">
            <span>${cargoIcons[v.cargoType] || "🚚"}</span>
            <span style="position: absolute; top: -3px; right: -3px; width: 8px; height: 8px; background: ${statusBorder}; border-radius: 50%; border: 1px solid white;"></span>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([v.coordinates.lat, v.coordinates.lng], {
          icon: vehicleIcon,
        }).addTo(layerGroup);

        // Breadcrumbs trail
        if (v.breadcrumbs && v.breadcrumbs.length > 1) {
          const trailPts = v.breadcrumbs.map((pt) => [pt.lat, pt.lng] as [number, number]);
          L.polyline(trailPts, {
            color: statusBorder,
            weight: 2,
            dashArray: "3, 5",
            opacity: 0.6,
          }).addTo(layerGroup);
        }

        marker.bindTooltip(`<b>${v.registrationNumber}</b><br/>${v.cargoDescription}<br/>Speed: ${v.speedKmh} km/h`, {
          direction: "top",
          className: "gis-tooltip",
        });

        marker.on("click", () => {
          onSelectVehicle(v);
          setActiveItem({ type: "vehicle", data: v });
        });
      });
    }

    // 4. Render Field Incidents
    if (showIncidents) {
      incidents.forEach((inc) => {
        const incidentIcon = L.divIcon({
          className: "custom-incident-icon",
          html: `<div style="background: #ef4444; border: 2px solid #ffffff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; animation: pulse 1.5s infinite; box-shadow: 0 0 15px rgba(239, 68, 68, 0.8);">
            ⚠️
          </div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], {
          icon: incidentIcon,
        }).addTo(layerGroup);

        marker.bindTooltip(`<b>INCIDENT: ${inc.incidentType}</b><br/>${inc.corridorName}<br/>Status: ${inc.status}`, {
          direction: "top",
          className: "gis-tooltip",
        });

        marker.on("click", () => {
          onSelectIncident(inc);
          setActiveItem({ type: "incident", data: inc });
        });
      });
    }

    // 5. Landslide / Flood High Vulnerability Heat Zones (GIS Hazard Layer)
    if (showHazardHeatmap) {
      const hazardZones = [
        { lat: 27.05, lng: 88.47, radius: 25000, risk: "Teesta River Landslide Choke Zone (Birik Dara)", color: "#ef4444" },
        { lat: 25.18, lng: 93.02, radius: 30000, risk: "Jatinga Slump & Mudflow Belt (Dima Hasao)", color: "#f97316" },
        { lat: 25.75, lng: 93.95, radius: 20000, risk: "Pagla Pahar Geological Fault (Nagaland)", color: "#f97316" },
        { lat: 27.65, lng: 93.85, radius: 28000, risk: "Subansiri Hydro-Monsoon Saturated Slopes", color: "#eab308" },
      ];

      hazardZones.forEach((hz) => {
        L.circle([hz.lat, hz.lng], {
          radius: hz.radius,
          color: hz.color,
          fillColor: hz.color,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: "5, 5",
        })
          .addTo(layerGroup)
          .bindTooltip(`<b>Hazard Zone:</b> ${hz.risk}`, { className: "gis-tooltip" });
      });
    }
  }, [corridors, bridges, vehicles, incidents, showCorridors, showBridges, showVehicles, showIncidents, showHazardHeatmap, detailedRoutes]);

  const getStatusBadge = (status: CorridorStatus) => {
    switch (status) {
      case "OPEN":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">OPEN (Clear)</span>;
      case "RESTRICTED":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">RESTRICTED (Single-lane)</span>;
      case "HIGH_RISK":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-700/50">HIGH RISK (Rainfall)</span>;
      case "BLOCKED":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">BLOCKED (Severe)</span>;
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[600px] flex flex-col md:flex-row bg-white/30 backdrop-blur-sm overflow-hidden shadow-sm border border-slate-200 rounded-2xl shadow-2xl shadow-black/50 m-2 md:m-4">
      {/* Main Map Container */}
      <div className="relative flex-1 h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0 grayscale-[20%] hover:grayscale-0 transition-all duration-700" />

        {/* Top Control Bar Over Map */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-lg border border-slate-200 shadow-md max-w-[calc(100%-2rem)]">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>NER GIS Layer Engine</span>
          </div>

          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* Layer Checkboxes */}
          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={showCorridors}
              onChange={(e) => setShowCorridors(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Highways ({corridors.length})</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={showBridges}
              onChange={(e) => setShowBridges(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>Bridges/Tunnels ({bridges.length})</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={showVehicles}
              onChange={(e) => setShowVehicles(e.target.checked)}
              className="rounded accent-purple-500"
            />
            <span>GPS Convoys ({vehicles.length})</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="rounded accent-red-500"
            />
            <span>Incidents ({incidents.length})</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={showWarehouses}
              onChange={(e) => setShowWarehouses(e.target.checked)}
              className="rounded accent-blue-500"
            />
            <span>Warehouses ({warehouses.length})</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900 hidden lg:flex">
            <input
              type="checkbox"
              checked={showHazardHeatmap}
              onChange={(e) => setShowHazardHeatmap(e.target.checked)}
              className="rounded accent-orange-500"
            />
            <span>Vulnerability Zones</span>
          </label>

          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* Tile Type Select */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={tileLayerType}
              onChange={(e) => setTileLayerType(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-1.5 py-0.5 outline-none text-xs cursor-pointer border border-slate-300"
            >
              <option value="standard">Carto Dark</option>
              <option value="topo">Topographic Terrain</option>
              <option value="satellite">Satellite Hybrid</option>
            </select>
          </div>
        </div>

        {/* Legend Overlay at Bottom Left */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-200 shadow-lg text-[11px] text-slate-700 flex flex-col gap-1.5 max-w-xs">
          <div className="font-semibold text-slate-800 flex items-center justify-between">
            <span>Corridor Accessibility Status</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded"></span>
              <span>Open & Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-400 rounded"></span>
              <span>Restricted (1-Lane)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-orange-500 rounded"></span>
              <span>High Risk (Warning)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-rose-500 rounded"></span>
              <span>Blocked (Landslide/Flood)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side Quick-Inspector Drawer */}
      <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-4 flex flex-col h-auto md:h-full overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm">
              {activeItem ? `GIS Inspector: ${activeItem.type.toUpperCase()}` : "NER Corridor Intelligence"}
            </h3>
          </div>
          {activeItem && (
            <button
              onClick={() => setActiveItem(null)}
              className="text-slate-500 hover:text-slate-800 p-1 rounded"
              title="Close inspection"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selected Item View */}
        {activeItem ? (
          <div className="py-4 space-y-4 text-xs">
            {activeItem.type === "corridor" && (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{activeItem.data.name}</h4>
                    <p className="text-slate-500">{activeItem.data.state} | {activeItem.data.code}</p>
                  </div>
                  {getStatusBadge(activeItem.data.status)}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Elevation:</span>
                    <span className="text-slate-800 font-medium">{activeItem.data.elevationProfile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">24h Rainfall:</span>
                    <span className="text-amber-700 font-semibold">{activeItem.data.environmentalMetrics.rainfall24h} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Soil Saturation:</span>
                    <span className="text-rose-700 font-semibold">{activeItem.data.environmentalMetrics.soilSaturation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Slope Incline:</span>
                    <span className="text-slate-800">{activeItem.data.environmentalMetrics.slopeInclineDegrees}°</span>
                  </div>
                </div>

                {activeItem.data.currentDisruption && (
                  <div className="bg-rose-50/40 p-3 rounded-lg border border-rose-800/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Active Disruption: {activeItem.data.currentDisruption.cause}</span>
                    </div>
                    <p className="text-rose-200 text-xs">{activeItem.data.currentDisruption.description}</p>
                    <p className="text-slate-500 text-[11px]">
                      Est. Clearance: <span className="text-rose-700 font-medium">{activeItem.data.currentDisruption.estimatedClearance}</span>
                    </p>
                  </div>
                )}

                {/* Tactical AI Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    id="gis-predict-disruption-btn"
                    onClick={() => onTriggerDisruptionAnalysis(activeItem.data)}
                    className="w-full py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 flex items-center justify-center gap-2 font-medium transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Run AI Disruption Forecast</span>
                  </button>

                  <button
                    id="gis-alternate-route-btn"
                    onClick={() => onTriggerAlternateRoute(activeItem.data)}
                    className="w-full py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center gap-2 font-medium transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                    <span>Calculate Alternate Routes</span>
                  </button>
                </div>
              </div>
            )}

            {activeItem.type === "bridge" && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">{activeItem.data.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                    {activeItem.data.type}
                  </span>
                  <span className="text-slate-500">{activeItem.data.state}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <p className="text-slate-700 leading-relaxed">{activeItem.data.strategicImportance}</p>
                  <div className="pt-2 border-t border-slate-300 flex justify-between text-slate-500">
                    <span>Max Weight Capacity:</span>
                    <span className="text-emerald-700 font-semibold">{activeItem.data.maxWeightTons} Tons</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Elevation:</span>
                    <span className="text-slate-800">{activeItem.data.elevationMeters}m ASL</span>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px]">
                  <strong>Operational Notes:</strong> {activeItem.data.details}
                </div>
              </div>
            )}

            {activeItem.type === "vehicle" && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{activeItem.data.registrationNumber}</h4>
                    <p className="text-slate-500">Driver: {activeItem.data.driverName} ({activeItem.data.contactNumber})</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    {activeItem.data.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div>
                    <span className="text-slate-500">Cargo:</span>
                    <p className="text-slate-900 font-medium">{activeItem.data.cargoDescription}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Origin ➔ Dest:</span>
                    <span className="text-slate-800 text-right">{activeItem.data.origin} ➔ {activeItem.data.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Speed:</span>
                    <span className="text-emerald-700 font-semibold">{activeItem.data.speedKmh} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Altitude:</span>
                    <span className="text-blue-700 font-semibold">{activeItem.data.altitudeMeters}m ASL</span>
                  </div>
                  {activeItem.data.temperatureControlled && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cold Chain Temp:</span>
                      <span className="text-emerald-600 font-bold">{activeItem.data.tempCelsius}°C (Nominal)</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">ETA / Delay:</span>
                    <span className="text-amber-700 font-medium">{activeItem.data.eta} (+{activeItem.data.delayMinutes}m)</span>
                  </div>
                </div>
              </div>
            )}

            {activeItem.type === "incident" && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-rose-700 text-sm">⚠️ {activeItem.data.incidentType}</h4>
                    <p className="text-slate-500">{activeItem.data.corridorName} ({activeItem.data.state})</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-200 border border-rose-800">
                    {activeItem.data.status}
                  </span>
                </div>

                <p className="text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded border border-slate-300 leading-relaxed">
                  {activeItem.data.description}
                </p>

                {activeItem.data.aiAssessment && (
                  <div className="bg-purple-50/40 p-3 rounded-lg border border-purple-800/50 space-y-2">
                    <div className="flex items-center gap-1.5 text-purple-700 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>AI Damage Assessment</span>
                    </div>
                    <p className="text-purple-200 text-xs">{activeItem.data.aiAssessment.damageSummary}</p>
                    <div className="text-[11px] text-slate-700 space-y-1">
                      <p>Clearance Time: <strong>{activeItem.data.aiAssessment.estimatedClearanceHours} Hours</strong></p>
                      <p>Passability: <strong>{activeItem.data.aiAssessment.passability.heavyFreight}</strong></p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeItem.type === "warehouse" && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {activeItem.data.type === "COLD_STORAGE" ? <Snowflake className="w-4 h-4 text-blue-500" /> : <WarehouseIcon className="w-4 h-4 text-slate-600" />}
                      {activeItem.data.name}
                    </h4>
                    <p className="text-slate-500">{activeItem.data.state}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    activeItem.data.status === "OPERATIONAL" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    activeItem.data.status === "AT_CAPACITY" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {activeItem.data.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Facility Type</span>
                    <span className="font-medium text-slate-800">{activeItem.data.type.replace(/_/g, ' ')}</span>
                  </div>
                  
                  <div className="pt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-500">Storage Capacity</span>
                      <span className="font-medium text-slate-800">{activeItem.data.capacityTons} Tons</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 mb-1">
                      <div 
                        className={`h-1.5 rounded-full ${activeItem.data.currentOccupancyPercent > 85 ? 'bg-rose-500' : 'bg-blue-500'}`}
                        style={{ width: `${activeItem.data.currentOccupancyPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Current Occupancy</span>
                      <span className={activeItem.data.currentOccupancyPercent > 85 ? 'text-rose-600 font-bold' : 'text-slate-500'}>{activeItem.data.currentOccupancyPercent}% Full</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
                  <h5 className="font-semibold text-blue-900 text-xs mb-1">Contact Information</h5>
                  <div className="grid grid-cols-[80px_1fr] gap-1 text-[11px]">
                    <span className="text-blue-700/70">Manager:</span>
                    <span className="text-blue-900 font-medium">{activeItem.data.contactPerson}</span>
                    
                    <span className="text-blue-700/70">Phone:</span>
                    <span className="text-blue-900 font-medium">{activeItem.data.contactNumber}</span>
                    
                    <span className="text-blue-700/70">Hours:</span>
                    <span className="text-blue-900 font-medium">{activeItem.data.operatingHours}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Default Overview List */
          <div className="py-4 space-y-3 text-xs">
            <p className="text-slate-500">
              Select any corridor, bridge, live vehicle, or incident marker on the map to inspect real-time logistics parameters.
            </p>

            <div className="space-y-2">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Active Lifeline Corridors ({corridors.length})
              </span>
              {corridors.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectCorridor(c);
                    setActiveItem({ type: "corridor", data: c });
                  }}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-50 border border-slate-200 border border-slate-200 cursor-pointer transition-all flex items-center justify-between gap-2"
                >
                  <div>
                    <h5 className="font-medium text-slate-800">{c.code}: {c.name.split(" ")[1] || c.code}</h5>
                    <p className="text-slate-500 text-[11px]">{c.state}</p>
                  </div>
                  {getStatusBadge(c.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
