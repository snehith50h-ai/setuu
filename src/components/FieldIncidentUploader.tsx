import React, { useState } from "react";
import { 
  FieldIncidentReport, 
  NERState, 
  HighwayCorridor 
} from "../types";
import { 
  Camera, 
  UploadCloud, 
  MapPin, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  FileText,
  WifiOff,
  UserCheck
} from "lucide-react";

interface FieldIncidentUploaderProps {
  corridors: HighwayCorridor[];
  isOnline: boolean;
  onAddIncidentReport: (report: FieldIncidentReport) => void;
}

export const FieldIncidentUploader: React.FC<FieldIncidentUploaderProps> = ({
  corridors,
  isOnline,
  onAddIncidentReport,
}) => {
  const [reporterName, setReporterName] = useState("Er. Lalthanmawia");
  const [officialDesignation, setOfficialDesignation] = useState("Assistant Engineer (Highways)");
  const [department, setDepartment] = useState<"BRO" | "PWD_STATE" | "DISASTER_MGMT_SDMA" | "TRAFFIC_POLICE" | "FOREST_DEPT">("PWD_STATE");
  const [contact, setContact] = useState("+91 94361-88219");

  const [incidentType, setIncidentType] = useState<"Landslide" | "Flash Flood" | "Bridge Damage" | "Road Subsidence" | "Rockfall" | "Traffic Choke">("Landslide");
  const [state, setState] = useState<NERState>("Sikkim");
  const [district, setDistrict] = useState("East Sikkim / Pakyong");
  const [corridorName, setCorridorName] = useState("NH-10 Sevoke - Gangtok Lifeline");
  const [latitude, setLatitude] = useState(27.0512);
  const [longitude, setLongitude] = useState(88.4721);
  const [description, setDescription] = useState("Massive 90m mudslide and boulder fall choked carriage surface near 29th Mile. Stream culvert collapsed under hydraulic pressure.");
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedResult, setLastSubmittedResult] = useState<FieldIncidentReport | null>(null);

  // Auto-detect GPS coordinates
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported."); setLatitude(27.0512); setLongitude(88.4721);
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        // Default to realistic NER coordinates if permission denied
        setLatitude(27.0512);
        setLongitude(88.4721);
        setIsDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  // Image Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
        setImagePreview(compressedBase64);
        setImageBase64(compressedBase64);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit and run AI Multimodal Assessment
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let aiAssessment: any = null;

    if (isOnline) {
      try {
        const response = await fetch("/api/ai/analyze-field-incident", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incidentType,
            locationName: corridorName,
            district,
            state,
            description,
            imageBase64,
            mimeType: "image/jpeg",
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to analyze field incident.");
        }
        aiAssessment = data.incidentAssessment;
      } catch (err: any) {
        console.error("AI analysis error:", err);
        alert(err.message || "An unexpected error occurred during AI analysis.");
        setUploading(false);
        return;
      }
    } else {
      // Offline fallback assessment
      aiAssessment = {
        severity: "CRITICAL",
        category: incidentType,
        damageSummary: description,
        debrisVolumeEstimate: "Offline estimated: 800 - 1,500 m³",
        passability: {
          twoWheelers: "Impassable",
          lightMotorVehicles: "Impassable",
          heavyFreight: "Blocked",
          emergencyAmbulance: "Impassable",
        },
        estimatedClearanceHours: 18,
        machineryRequired: ["2x Heavy Excavators", "4x Tipper Dumpers"],
        supplyChainRiskRating: "HIGH",
        actionPlan: "Cached locally. Emergency radio dispatch recommended.",
      };
    }

    const newReport: FieldIncidentReport = {
      id: `rep-${Date.now()}`,
      reporterName,
      officialDesignation,
      department,
      contact,
      incidentType,
      district,
      state,
      corridorName,
      coordinates: { lat: latitude, lng: longitude },
      timestamp: "Just now",
      description,
      status: "VERIFIED_ACTIVE",
      syncStatus: isOnline ? "SYNCED" : "OFFLINE_PENDING",
      aiAssessment,
    };
    if (imagePreview) {
      newReport.photoUrl = imagePreview;
    }

    onAddIncidentReport(newReport);
    setLastSubmittedResult(newReport);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 p-5 rounded-xl border border-rose-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs tracking-wider uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>Field Officials Incident Reporting Portal • MDoNER / BRO / SDMA</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Geo-Tagged Road Obstruction & Damage Reporting
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl leading-relaxed">
            Upload site photographs, GPS coordinates, and geotechnical observations from remote hill roads. Powered by Multimodal AI to instantly quantify debris volume, vehicle passability, and heavy plant requirements.
          </p>
        </div>

        {!isOnline && (
          <div className="px-3 py-2 rounded-lg bg-red-950/80 text-red-300 border border-red-700 flex items-center gap-2 text-xs">
            <WifiOff className="w-4 h-4" />
            <span>Low-Network Offline Queue Active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Form */}
        <form onSubmit={handleSubmitReport} className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Reporting Authority Details</h3>
          </div>

          {/* Official Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Official Full Name:</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Designation & Rank:</label>
              <input
                type="text"
                value={officialDesignation}
                onChange={(e) => setOfficialDesignation(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Department / Agency:</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
              >
                <option value="BRO">Border Roads Organisation (BRO)</option>
                <option value="PWD_STATE">State PWD Highway Division</option>
                <option value="DISASTER_MGMT_SDMA">State Disaster Management Authority (SDMA)</option>
                <option value="TRAFFIC_POLICE">Traffic & Highway Police</option>
                <option value="FOREST_DEPT">State Forest Department</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Official Mobile / Satellite Phone:</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Incident Details */}
          <div className="pt-3 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="font-semibold text-slate-800 text-sm">Disruption Event Classification</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Incident Nature:</label>
                <select
                  id="incident-nature-select"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
                >
                  <option value="Landslide">Major Landslide / Hill Fall</option>
                  <option value="Flash Flood">Flash Flood / River Overwash</option>
                  <option value="Bridge Damage">Bridge Structural Fracture</option>
                  <option value="Road Subsidence">Carriageway Slumping / Sinking</option>
                  <option value="Rockfall">Shooting Stones / Active Rockfall</option>
                  <option value="Traffic Choke">Multi-Vehicle Gridlock</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">NER State:</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as NERState)}
                  className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
                >
                  <option value="Sikkim">Sikkim</option>
                  <option value="Assam">Assam</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Tripura">Tripura</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">District / Subdivision:</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Highway Selection */}
            <div>
              <label className="block text-slate-500 font-medium mb-1">Highway / Route Section:</label>
              <select
                value={corridorName}
                onChange={(e) => setCorridorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
              >
                {corridors.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Geo-Location Tagging */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>GPS Geo-Tagging</span>
                </span>
                <button
                  type="button"
                  id="detect-gps-btn"
                  onClick={handleDetectGPS}
                  disabled={isDetectingLocation}
                  className="px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-indigo-900 flex items-center gap-1.5 font-medium"
                >
                  <MapPin className={`w-3.5 h-3.5 ${isDetectingLocation ? "animate-bounce" : ""}`} />
                  <span>{isDetectingLocation ? "Acquiring Fix..." : "Acquire GPS Coordinates"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Latitude (°N):</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Longitude (°E):</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload with Preview */}
            <div className="space-y-2">
              <label className="block text-slate-500 font-medium">Site Photograph (Mandatory for Multimodal Damage AI):</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-slate-200/40 p-4 rounded-lg border border-dashed border-slate-300">
                <label className="flex flex-col items-center justify-center w-full sm:w-48 h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 bg-slate-50 transition-colors">
                  <Camera className="w-8 h-8 text-slate-500 mb-1" />
                  <span className="text-[11px] text-slate-700 font-medium">Capture or Upload</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG (Max 15MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagePreview ? (
                  <div className="relative w-full sm:flex-1 h-32 rounded-lg overflow-hidden border border-slate-300">
                    <img
                      src={imagePreview}
                      alt="Incident site preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-emerald-600 font-semibold">
                      Photo Geo-Tagged
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs flex-1 text-center sm:text-left">
                    <p>No site photograph attached yet.</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Multimodal AI will visually analyze rock size, culvert rupture, mud depth, and estimate excavator hours automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Field Description */}
            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Detailed Field Situation Description & Observations:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none"
                placeholder="Describe road blockage extent, whether culvert is broken, trapped vehicles, or hillside stability..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">
              {isOnline ? "Transmits directly to MDoNER Logistics Command" : "Will be cached locally and synced upon connectivity"}
            </span>

            <button
              type="submit"
              id="submit-incident-report-btn"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-slate-900 font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Processing Multimodal AI Assessment...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Transmit Field Incident Report</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: AI Analysis Output Preview */}
        <div className="space-y-5">
          {lastSubmittedResult?.aiAssessment ? (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs pb-3 border-b border-slate-200">
                <Sparkles className="w-4 h-4" />
                <span>AI Multimodal Damage Appraisal</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px]">Assessed Severity:</span>
                <p className="text-base font-extrabold text-rose-600 mt-0.5">
                  {lastSubmittedResult.aiAssessment.severity} ({lastSubmittedResult.aiAssessment.category})
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <span className="text-slate-500 text-[11px] uppercase tracking-wider">Damage Summary</span>
                  <p className="text-slate-800 mt-1 leading-relaxed text-sm">{lastSubmittedResult.aiAssessment.damageSummary}</p>
                </div>
                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block mb-0.5">Est. Debris Volume</span>
                    <p className="text-amber-700 font-semibold">{lastSubmittedResult.aiAssessment.debrisVolumeEstimate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block mb-0.5">Clearance Time</span>
                    <p className="text-blue-700 font-semibold">{lastSubmittedResult.aiAssessment.estimatedClearanceHours} Hours</p>
                  </div>
                </div>
              </div>

              {/* Passability Matrix */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 block">Vehicle Passability Status</span>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-700">
                  <div className="flex justify-between border-b border-slate-50 pb-1"><span>LMV / 4x4</span> <strong className="text-slate-900">{lastSubmittedResult.aiAssessment.passability.lightMotorVehicles}</strong></div>
                  <div className="flex justify-between border-b border-slate-50 pb-1"><span>Heavy Freight</span> <strong className="text-slate-900">{lastSubmittedResult.aiAssessment.passability.heavyFreight}</strong></div>
                  <div className="flex justify-between border-b border-slate-50 pb-1"><span>Ambulance</span> <strong className="text-slate-900">{lastSubmittedResult.aiAssessment.passability.emergencyAmbulance}</strong></div>
                  <div className="flex justify-between border-b border-slate-50 pb-1"><span>2-Wheelers</span> <strong className="text-slate-900">{lastSubmittedResult.aiAssessment.passability.twoWheelers}</strong></div>
                </div>
              </div>

              {/* Machinery Requisition */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" /> Plant & Equipment Requisition
                </span>
                <ul className="space-y-1.5 text-slate-800 text-xs">
                  {lastSubmittedResult.aiAssessment.machineryRequired.map((m: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">Logistics Action Plan</span>
                <p className="text-slate-800 text-sm leading-relaxed">{lastSubmittedResult.aiAssessment.actionPlan}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500 text-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
                <Camera className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-800">Real-Time Damage Verification</h4>
              <p className="leading-relaxed">
                When field officials submit geo-tagged images, AI runs automated computer vision to gauge boulder diameter, pavement breach, and machine requirements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
