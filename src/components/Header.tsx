import React from "react";
import { 
  Languages, 
  Volume2
} from "lucide-react";
import { SupportedLanguage } from "../types";
import { PWAInstallButton } from "./PWAInstallButton";

interface HeaderProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  alertsCount: number;
  onOpenAlertsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  onToggleOnline,
  currentLanguage,
  onLanguageChange,
  alertsCount,
  onOpenAlertsModal,
}) => {
  const languages: SupportedLanguage[] = [
    "English",
    "Hindi",
    "Assamese",
    "Bengali",
    "Manipuri",
    "Mizo",
    "Khasi",
    "Nagamese",
  ];

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">NER-SILAP <span className="text-xs font-normal text-slate-500 ml-2">v2.4.0</span></h1>
          <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">MDoNER Logistics Intelligence</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <PWAInstallButton />
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-xs text-slate-500">Network Status</span>
          <button onClick={onToggleOnline} className={`text-xs font-medium flex items-center gap-1 ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span> 
            {isOnline ? "Optimal Visibility" : "Offline / Remote"}
          </button>
        </div>
        <div className="hidden lg:block w-px h-8 bg-slate-200"></div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-mono text-slate-700">23.47°N, 91.27°E</p>
          <p className="text-[10px] text-slate-500">Agartala, Tripura • {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit' })} IST</p>
        </div>
        <div className="hidden md:block w-px h-8 bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-700 text-xs">
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <select
              id="language-select-dropdown"
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-transparent text-slate-700 outline-none text-xs cursor-pointer font-medium"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-white text-slate-800">
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <button
            id="emergency-alert-siren-btn"
            onClick={onOpenAlertsModal}
            className="relative px-2.5 py-1.5 rounded text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 shadow-sm"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
            {alertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-slate-900 text-[10px] flex items-center justify-center font-bold">
                {alertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
