import React, { useState } from "react";
import { X, Truck, Save } from "lucide-react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { HighwayCorridor, CargoCategory, TrackedVehicle } from "../types";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  corridors: HighwayCorridor[];
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, corridors }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: "",
    driverName: "",
    contactNumber: "",
    cargoType: "PDS_FOOD_GRAINS" as CargoCategory,
    cargoDescription: "",
    cargoPriority: "STANDARD" as "CRITICAL" | "HIGH" | "STANDARD",
    weightTons: 10,
    origin: "",
    destination: "",
    currentCorridorId: corridors[0]?.id || ""
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedCorridor = corridors.find(c => c.id === formData.currentCorridorId);
      const startPoint = selectedCorridor?.coordinatesPath?.[0] || selectedCorridor?.centerCoordinates || { lat: 26.1433, lng: 91.7898 };

      const vehicleRef = doc(collection(db, "vehicles"));
      const newVehicle: TrackedVehicle = {
        id: vehicleRef.id,
        ...formData,
        weightTons: Number(formData.weightTons),
        coordinates: startPoint,
        speedKmh: Math.floor(Math.random() * 20) + 30, // 30-50 km/h initial speed
        altitudeMeters: Math.floor(Math.random() * 500) + 200,
        fuelBatteryPercent: 100,
        status: "ON_TRACK",
        delayMinutes: 0,
        eta: "Pending",
        lastUpdated: new Date().toISOString(),
        breadcrumbs: [startPoint],
        routeProgressIndex: 0
      };

      await setDoc(vehicleRef, newVehicle);
      onClose();
    } catch (error) {
      console.error("Failed to add vehicle:", error);
      alert("Failed to add vehicle. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <Truck className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-lg">Register New Logistics Vehicle</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <form id="add-vehicle-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Vehicle Registration Number</label>
                <input required type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="e.g. AS-01-HC-1234" className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Driver Name</label>
                <input required type="text" name="driverName" value={formData.driverName} onChange={handleChange} placeholder="e.g. Biju Phukan" className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Driver ID / Contact Number</label>
                <input required type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="e.g. +91 9876543210" className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Vehicle Gross Weight (Tons)</label>
                <input required type="number" step="0.1" name="weightTons" value={formData.weightTons} onChange={handleChange} className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="border-t border-slate-200 my-2 pt-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Cargo Category</label>
                <select name="cargoType" value={formData.cargoType} onChange={handleChange} className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                  <option value="MEDICINES_VACCINES">💊 Medicines & Vaccines</option>
                  <option value="PDS_FOOD_GRAINS">🍚 PDS Food Grains</option>
                  <option value="POL_FUEL_TANKERS">⛽ POL Fuel Tankers</option>
                  <option value="STRATEGIC_CONSTRUCTION_BRO">🏗️ Strategic Construction</option>
                  <option value="AGRI_HORTICULTURE">🍍 Agri / Horticulture</option>
                  <option value="DISASTER_RELIEF">⚡ Disaster Relief</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Cargo Priority</label>
                <select name="cargoPriority" value={formData.cargoPriority} onChange={handleChange} className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                  <option value="STANDARD">Standard</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Emergency</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Cargo Description</label>
                <input required type="text" name="cargoDescription" value={formData.cargoDescription} onChange={handleChange} placeholder="e.g. 10 Pallets of Paracetamol, 2 Pallets of Syringes" className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="border-t border-slate-200 my-2 pt-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Route / Corridor</label>
                <select name="currentCorridorId" value={formData.currentCorridorId} onChange={handleChange} className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                  {corridors.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Origin</label>
                  <input required type="text" name="origin" value={formData.origin} onChange={handleChange} placeholder="e.g. Guwahati" className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Destination</label>
                  <input required type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="e.g. Shillong" className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="add-vehicle-form" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
            {isSubmitting ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Register Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};
