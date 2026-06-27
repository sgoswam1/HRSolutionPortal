import React from "react";
import { usePreferences, TimeZoneType, CurrencyType, ThemeType } from "../context/PreferencesContext";
import { X, Globe, DollarSign, Palette, Check } from "lucide-react";

interface PreferencesModalProps {
  onClose: () => void;
}

export default function PreferencesModal({ onClose }: PreferencesModalProps) {
  const {
    timezone,
    currency,
    theme,
    setTimezone,
    setCurrency,
    setTheme,
    styles
  } = usePreferences();

  const timezones: { value: TimeZoneType; label: string; desc: string }[] = [
    { value: "UTC", label: "Coordinated Universal Time (UTC)", desc: "Global Standard GMT+0" },
    { value: "EST", label: "Eastern Standard Time (EST)", desc: "New York / Toronto (GMT-5)" },
    { value: "PST", label: "Pacific Standard Time (PST)", desc: "Los Angeles / Vancouver (GMT-8)" },
    { value: "GMT", label: "Greenwich Mean Time (GMT)", desc: "London / Dublin (GMT+0)" },
    { value: "IST", label: "Indian Standard Time (IST)", desc: "Mumbai / New Delhi (GMT+5:30)" }
  ];

  const currencies: { value: CurrencyType; label: string; symbol: string; desc: string }[] = [
    { value: "USD", label: "United States Dollar", symbol: "$", desc: "Base currency configuration" },
    { value: "EUR", label: "Euro", symbol: "€", desc: "European exchange proxy (0.92x)" },
    { value: "GBP", label: "British Pound", symbol: "£", desc: "UK sterling proxy (0.79x)" },
    { value: "INR", label: "Indian Rupee", symbol: "₹", desc: "Indian national rupee proxy (83.5x)" }
  ];

  const themes: { value: ThemeType; label: string; bgClass: string; borderClass: string; textClass: string; desc: string }[] = [
    {
      value: "light",
      label: "Modern Light",
      bgClass: "bg-slate-50",
      borderClass: "border-slate-200",
      textClass: "text-slate-800",
      desc: "Clean light gray and crisp slate typography"
    },
    {
      value: "dark",
      label: "Cosmic Dark",
      bgClass: "bg-[#0d131f]",
      borderClass: "border-slate-800",
      textClass: "text-slate-100",
      desc: "Immersive starry cosmic blues and dark grays"
    },
    {
      value: "sepia",
      label: "Editorial Sepia",
      bgClass: "bg-[#fdfbf7]",
      borderClass: "border-[#e3d5c5]",
      textClass: "text-[#4a3f35]",
      desc: "Warm ambient book paper cream and rich amber borders"
    }
  ];

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className={`w-full max-w-xl rounded-3xl border p-6 shadow-2xl transition-colors duration-200 ${styles.panel} ${styles.text}`}>
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-4 mb-5 border-slate-200 dark:border-slate-800 sepia:border-[#e3d5c5]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 sepia:bg-[#f4ebe1] sepia:text-[#8a7a6a] border border-sky-100 dark:border-sky-900 sepia:border-[#e3d5c5]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`font-bold font-sans tracking-tight text-sm ${styles.heading}`}>
                User Preference Module
              </h3>
              <p className={`text-3xs ${styles.subtext} mt-0.5 font-medium`}>
                Configure timezone, currency proxy rates, and theme skins.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preferences"
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 sepia:hover:bg-[#f4ebe1] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          
          {/* Theme Skin Picker */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-sky-500 dark:text-sky-400 sepia:text-[#8a7a6a]" />
              <span className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.heading}`}>
                1. Interface Skin Theme
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themes.map((t) => {
                const isActive = theme === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-sky-500 ring-2 ring-sky-500/20"
                        : "border-slate-200 hover:border-slate-350 dark:border-slate-800 sepia:border-[#e3d5c5]"
                    } ${t.bgClass}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${t.textClass}`}>
                          {t.label}
                        </span>
                        {isActive && (
                          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sky-500 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-4xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                        {t.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Zone Picker */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-sky-500 dark:text-sky-400 sepia:text-[#8a7a6a]" />
              <span className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.heading}`}>
                2. Schedulers Time-Zone
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {timezones.map((tz) => {
                const isActive = timezone === tz.value;
                return (
                  <button
                    key={tz.value}
                    onClick={() => setTimezone(tz.value)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-sky-500 bg-sky-50/10 dark:bg-sky-950/10"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/40 sepia:border-[#e3d5c5] sepia:hover:bg-[#f4ebe1]/40"
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-semibold block ${isActive ? "text-sky-600 dark:text-sky-400" : ""}`}>
                        {tz.label}
                      </span>
                      <span className={`text-4xs block mt-0.5 ${styles.subtext}`}>
                        {tz.desc}
                      </span>
                    </div>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency Picker */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-sky-500 dark:text-sky-400 sepia:text-[#8a7a6a]" />
              <span className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.heading}`}>
                3. Financial Currency Rate
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currencies.map((curr) => {
                const isActive = currency === curr.value;
                return (
                  <button
                    key={curr.value}
                    onClick={() => setCurrency(curr.value)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-sky-500 bg-sky-50/10 dark:bg-sky-950/10"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/40 sepia:border-[#e3d5c5] sepia:hover:bg-[#f4ebe1]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm">
                        {curr.symbol}
                      </span>
                      <div>
                        <span className={`text-xs font-semibold block ${isActive ? "text-sky-600 dark:text-sky-400" : ""}`}>
                          {curr.label} ({curr.value})
                        </span>
                        <span className={`text-4xs block mt-0.5 ${styles.subtext}`}>
                          {curr.desc}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-4 mt-5 border-t border-slate-200 dark:border-slate-800 sepia:border-[#e3d5c5] text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
          >
            Apply Configurations
          </button>
        </div>

      </div>
    </div>
  );
}
