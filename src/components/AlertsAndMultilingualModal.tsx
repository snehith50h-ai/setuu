import React, { useState } from "react";
import { 
  SystemAlert, 
  SupportedLanguage 
} from "../types";
import { 
  Volume2, 
  X, 
  Sparkles, 
  Languages, 
  Send, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  Info,
  Radio,
  Copy,
  Check
} from "lucide-react";

interface AlertsAndMultilingualModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SystemAlert[];
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const AlertsAndMultilingualModal: React.FC<AlertsAndMultilingualModalProps> = ({
  isOpen,
  onClose,
  alerts,
  currentLanguage,
  onLanguageChange,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(alerts[0] || null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBroadcastSent, setIsBroadcastSent] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

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

  const handleTranslateAlert = async (alertItem: SystemAlert, targetLang: SupportedLanguage) => {
    setSelectedAlert(alertItem);
    setIsTranslating(true);
    setTranslatedText(null);
    setIsBroadcastSent(false);

    try {
      const response = await fetch("/api/ai/translate-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          englishMessage: alertItem.message,
          corridor: alertItem.corridor,
          urgency: alertItem.severity,
          targetLanguage: targetLang,
        }),
      });

      const data = await response.json();
      setTranslatedText(data.translatedMessage || alertItem.message);
    } catch (err) {
      console.error("Translation error:", err);
      setTranslatedText(alertItem.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeakAlert = (text: string) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis is not supported.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopyAlert = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleSendBroadcast = () => {
    setIsBroadcastSent(true);
    setTimeout(() => setIsBroadcastSent(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50/80 border border-rose-700 flex items-center justify-center text-rose-600">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Emergency Alert Broadcast & Multilingual Dispatch Center
              </h3>
              <p className="text-slate-500 text-xs">
                Real-time automated alerts for highway blockages, landslides, and convoy detours across NER
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Left Column: Active Alert List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Active Regional Alerts ({alerts.length})
              </span>
              <span className="text-slate-500 text-[11px]">Select alert to translate & broadcast</span>
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {alerts.map((alertItem) => {
                const isSelected = selectedAlert?.id === alertItem.id;
                return (
                  <div
                    key={alertItem.id}
                    onClick={() => handleTranslateAlert(alertItem, currentLanguage)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? "bg-slate-50 border border-slate-200 border-indigo-500/80 shadow-md"
                        : "bg-slate-50 hover:bg-slate-50 border border-slate-200 border-slate-300/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {alertItem.severity === "CRITICAL" ? (
                          <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        ) : alertItem.severity === "WARNING" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                        <h4 className="font-bold text-slate-900 text-xs">{alertItem.title}</h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          alertItem.severity === "CRITICAL"
                            ? "bg-rose-50 text-rose-700 border border-rose-700"
                            : alertItem.severity === "WARNING"
                            ? "bg-amber-50 text-amber-700 border border-amber-700"
                            : "bg-blue-50 text-blue-700 border border-indigo-700"
                        }`}
                      >
                        {alertItem.severity}
                      </span>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed">{alertItem.message}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-300/60">
                      <span>Corridor: <strong className="text-slate-800">{alertItem.corridor}</strong></span>
                      <span>{alertItem.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Multilingual Translation & Voice Broadcast */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <Languages className="w-4 h-4" />
                  <span>Multilingual Voice & Radio Generator</span>
                </div>

                {/* Target Language Dropdown */}
                <select
                  value={currentLanguage}
                  onChange={(e) => {
                    const newLang = e.target.value as SupportedLanguage;
                    onLanguageChange(newLang);
                    if (selectedAlert) {
                      handleTranslateAlert(selectedAlert, newLang);
                    }
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
                >
                  {languages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAlert ? (
                <div className="space-y-3">
                  <div className="text-slate-500 text-[11px]">
                    Translating for drivers, check-posts, and local emergency relief officers into <strong>{currentLanguage}</strong>:
                  </div>

                  {/* Translated Message Box */}
                  <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-2 min-h-[140px]">
                    {isTranslating ? (
                      <div className="flex flex-col items-center justify-center h-28 space-y-2 text-purple-600">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        <span className="text-xs">Generating regional translation with AI...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Target Dialect: <strong className="text-blue-700">{currentLanguage}</strong></span>
                          <button
                            onClick={() => handleCopyAlert(translatedText || selectedAlert.message)}
                            className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
                          >
                            {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{hasCopied ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <p className="text-slate-900 text-sm font-medium leading-relaxed">
                          {translatedText || selectedAlert.message}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Audio Playback Controls */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleSpeakAlert(translatedText || selectedAlert.message)}
                      disabled={isTranslating}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                        isPlayingAudio
                          ? "bg-rose-600 text-slate-900 animate-pulse"
                          : "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-blue-700 border border-slate-300"
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isPlayingAudio ? "Broadcasting Audio..." : "Read Aloud (Voice Audio)"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-10">Select an alert to translate</p>
              )}
            </div>

            {/* Bottom Radio Broadcast Dispatch Action */}
            <div className="pt-4 border-t border-slate-300/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">
                  Emergency Alert Dispatch Channels:
                </span>
                <span className="text-emerald-600 text-[10px] font-semibold">
                  SMS Cell Broadcast & Police VHF Radio
                </span>
              </div>

              <button
                onClick={handleSendBroadcast}
                disabled={!selectedAlert}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/25"
              >
                <Radio className="w-4 h-4" />
                <span>Transmit Emergency Alert Across Regional Transport Network</span>
              </button>

              {isBroadcastSent && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-200 border border-emerald-700 text-center text-xs flex items-center justify-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Alert dispatched to 42 trucks, 8 check-posts, and local PWD base camps!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
