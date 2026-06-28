import React, { createContext, useContext, useState, useEffect } from "react";

export type TimeZoneType = "UTC" | "EST" | "PST" | "GMT" | "IST";
export type CurrencyType = "USD" | "EUR" | "GBP" | "INR";
export type ThemeType = "light" | "dark" | "sepia";

export interface ThemeStyles {
  bg: string;
  text: string;
  panel: string;
  border: string;
  subtext: string;
  heading: string;
  input: string;
  navbar: string;
  badge: string;
  buttonSecondary: string;
  buttonPrimary: string;
  buttonAccent: string;
}

interface PreferencesContextProps {
  timezone: TimeZoneType;
  currency: CurrencyType;
  theme: ThemeType;
  setTimezone: (tz: TimeZoneType) => void;
  setCurrency: (curr: CurrencyType) => void;
  setTheme: (theme: ThemeType) => void;
  formatDateTime: (dateTimeStr: string) => string;
  formatCurrency: (salaryStr: string) => string;
  styles: ThemeStyles;
}

const PreferencesContext = createContext<PreferencesContextProps | undefined>(undefined);

const themeConfigurations: Record<ThemeType, ThemeStyles> = {
  light: {
    bg: "bg-slate-50/80 text-slate-700",
    text: "text-slate-700",
    panel: "bg-white border-slate-200/80 shadow-md shadow-slate-100/80 rounded-3xl",
    border: "border-slate-200/70",
    subtext: "text-slate-500",
    heading: "text-slate-900 font-extrabold tracking-tight",
    input: "bg-white border-slate-200 text-slate-900 focus:border-indigo-500 shadow-2xs focus:ring-4 focus:ring-indigo-500/5 transition",
    navbar: "bg-white/90 backdrop-blur-md border-slate-200/70 text-slate-800 shadow-xs",
    badge: "bg-slate-100/80 text-slate-700 border-slate-200/50",
    buttonSecondary: "bg-white hover:bg-slate-50/80 text-slate-700 hover:text-slate-900 border-slate-250 hover:border-slate-300/90 shadow-2xs transition-all duration-150 active:scale-[0.98]",
    buttonPrimary: "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold shadow-xs hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-150 active:scale-[0.98] cursor-pointer",
    buttonAccent: "border-indigo-100 bg-indigo-50/70 text-indigo-600 hover:bg-indigo-50",
  },
  dark: {
    bg: "bg-[#090e17] text-slate-300",
    text: "text-slate-300",
    panel: "bg-[#0d131f] border-[#1e293b]/70 shadow-lg shadow-[#04060b]/50 rounded-3xl",
    border: "border-[#1e293b]/50",
    subtext: "text-slate-400",
    heading: "text-white font-extrabold tracking-tight",
    input: "bg-[#121824] border-slate-800 focus:bg-[#161e2e] text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition",
    navbar: "bg-[#090e17]/90 backdrop-blur-md border-slate-800/80 text-slate-100 shadow-xs",
    badge: "bg-[#121824] text-slate-300 border-slate-800/50",
    buttonSecondary: "bg-[#121824] border-slate-800/80 text-slate-300 hover:bg-[#1c263b] hover:text-white hover:border-slate-700 shadow-2xs transition-all duration-150 active:scale-[0.98]",
    buttonPrimary: "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold shadow-xs hover:shadow-md hover:shadow-indigo-500/20 transition-all duration-150 active:scale-[0.98] cursor-pointer",
    buttonAccent: "border-indigo-900 bg-indigo-950/30 text-indigo-400 hover:bg-indigo-950/60",
  },
  sepia: {
    bg: "bg-[#f4efe1] text-[#4a3f35]",
    text: "text-[#4a3f35]",
    panel: "bg-[#fdfbf7] border-[#e3d5c5] shadow-md shadow-[#e9e3d3]/50 rounded-3xl",
    border: "border-[#e3d5c5]/80",
    subtext: "text-[#8a7a6a]",
    heading: "text-[#2e241b] font-extrabold tracking-tight",
    input: "bg-[#fdfbf7] border-[#e3d5c5] focus:bg-white text-[#2e241b] focus:border-[#c5b19c] focus:ring-4 focus:ring-[#c5b19c]/10 transition",
    navbar: "bg-[#fdfbf7]/90 backdrop-blur-md border-[#e3d5c5]/80 text-[#2e241b] shadow-xs",
    badge: "bg-[#f4efe1]/80 text-[#5c4f42] border-[#e3d5c5]/60",
    buttonSecondary: "bg-[#fdfbf7] border-[#e3d5c5] text-[#4a3f35] hover:bg-[#f4efe1]/40 hover:text-[#2e241b] hover:border-[#c5b19c] shadow-2xs transition-all duration-150 active:scale-[0.98]",
    buttonPrimary: "bg-[#5c4f42] hover:bg-[#4a3f35] active:bg-[#3b322a] text-[#fdfbf7] font-extrabold shadow-xs hover:shadow-md hover:shadow-[#5c4f42]/10 transition-all duration-150 active:scale-[0.98] cursor-pointer",
    buttonAccent: "border-[#c5b19c] bg-[#ece4d4] text-[#5c4f42] hover:bg-[#e3d5c5]",
  },
};

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timezone, setTimezoneState] = useState<TimeZoneType>("UTC");
  const [currency, setCurrencyState] = useState<CurrencyType>("USD");
  const [theme, setThemeState] = useState<ThemeType>("light");

  // Load from local storage on mount
  useEffect(() => {
    const savedTimezone = localStorage.getItem("pref_timezone") as TimeZoneType;
    const savedCurrency = localStorage.getItem("pref_currency") as CurrencyType;
    const savedTheme = localStorage.getItem("pref_theme") as ThemeType;

    if (savedTimezone) setTimezoneState(savedTimezone);
    if (savedCurrency) setCurrencyState(savedCurrency);
    if (savedTheme) setThemeState(savedTheme);
  }, []);

  const setTimezone = (tz: TimeZoneType) => {
    setTimezoneState(tz);
    localStorage.setItem("pref_timezone", tz);
  };

  const setCurrency = (curr: CurrencyType) => {
    setCurrencyState(curr);
    localStorage.setItem("pref_currency", curr);
  };

  const setTheme = (t: ThemeType) => {
    setThemeState(t);
    localStorage.setItem("pref_theme", t);
  };

  // Update body styles when theme changes to keep background integrated
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (theme === "dark") {
      document.body.style.backgroundColor = "#090e17";
      document.body.style.color = "#cbd5e1";
    } else if (theme === "sepia") {
      document.body.style.backgroundColor = "#f4efe1";
      document.body.style.color = "#4a3f35";
    } else {
      document.body.style.backgroundColor = "#f8fafc";
      document.body.style.color = "#334155";
    }
  }, [theme]);

  // Formatter: Date/Time based on selected timezone
  const formatDateTime = (dateTimeStr: string): string => {
    if (!dateTimeStr) return "";
    try {
      const normalized = dateTimeStr.includes("T") ? dateTimeStr : dateTimeStr.replace(" ", "T");
      const date = new Date(normalized);
      if (isNaN(date.getTime())) return dateTimeStr;

      let timeZoneName = "UTC";
      if (timezone === "EST") timeZoneName = "America/New_York";
      else if (timezone === "PST") timeZoneName = "America/Los_Angeles";
      else if (timezone === "GMT") timeZoneName = "Europe/London";
      else if (timezone === "IST") timeZoneName = "Asia/Kolkata";

      const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: timeZoneName }).format(date);
      const dayNum = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: timeZoneName }).format(date);
      const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: timeZoneName }).format(date);
      const year = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: timeZoneName }).format(date);
      const time = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: timeZoneName }).format(date);

      // Add ordinal suffix to day
      const getOrdinalSuffix = (numStr: string) => {
        const n = parseInt(numStr, 10);
        if (isNaN(n)) return numStr;
        if (n >= 11 && n <= 13) return `${n}th`;
        switch (n % 10) {
          case 1:  return `${n}st`;
          case 2:  return `${n}nd`;
          case 3:  return `${n}rd`;
          default: return `${n}th`;
        }
      };

      const dayWithSuffix = getOrdinalSuffix(dayNum);
      return `${weekday}, ${month} ${dayWithSuffix}, ${year} • ${time} (${timezone})`;
    } catch (e) {
      return dateTimeStr;
    }
  };

  // Formatter: Currency based on selected currency rates
  const formatCurrency = (salaryStr: string): string => {
    if (!salaryStr) return "";

    const config: Record<CurrencyType, { symbol: string; rate: number }> = {
      USD: { symbol: "$", rate: 1.0 },
      EUR: { symbol: "€", rate: 0.92 },
      GBP: { symbol: "£", rate: 0.79 },
      INR: { symbol: "₹", rate: 83.5 },
    };

    const { symbol, rate } = config[currency] || config.USD;
    if (rate === 1.0) return salaryStr;

    let processed = salaryStr;
    const numberRegex = /(\d[\d,.]*)/g;

    processed = salaryStr.replace(numberRegex, (match) => {
      const cleanNumStr = match.replace(/,/g, "");
      const value = parseFloat(cleanNumStr);
      if (isNaN(value)) return match;

      const scaled = value * rate;

      // Handle custom display rules
      if (cleanNumStr.includes(".") || scaled % 1 !== 0) {
        return scaled.toLocaleString("en-US", { maximumFractionDigits: 1 });
      } else {
        return Math.round(scaled).toLocaleString("en-US");
      }
    });

    // Replace all USD $ signs with local currency signs
    processed = processed.replace(/\$/g, symbol);

    return processed;
  };

  const styles = themeConfigurations[theme];

  return (
    <PreferencesContext.Provider
      value={{
        timezone,
        currency,
        theme,
        setTimezone,
        setCurrency,
        setTheme,
        formatDateTime,
        formatCurrency,
        styles,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};
