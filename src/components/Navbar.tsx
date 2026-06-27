import React from "react";
import { User } from "../types";
import { Briefcase, LogOut, Terminal, Layers, HelpCircle, PhoneCall, UserCheck, Settings } from "lucide-react";
import { usePreferences } from "../context/PreferencesContext";

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConsole: () => void;
  onOpenPreferences: () => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenConsole,
  onOpenPreferences,
}: NavbarProps) {
  const { styles } = usePreferences();

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors duration-200 ${styles.navbar}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("welcome")}
            className="flex items-center gap-2 font-bold focus:outline-none cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-indigo-100">
              <Briefcase className="h-5.5 w-5.5" />
            </div>
            <div className="text-left leading-none">
              <span className={`block text-lg font-bold tracking-tight ${styles.heading}`}>
                HRSolutions
              </span>
              <span className="text-2xs font-mono text-sky-600 tracking-wider uppercase font-semibold">
                Enterprise
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("welcome")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "welcome"
                  ? "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-semibold"
                  : `${styles.subtext} hover:${styles.heading} hover:opacity-80`
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "about"
                  ? "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-semibold"
                  : `${styles.subtext} hover:${styles.heading} hover:opacity-80`
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "contact"
                  ? "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-semibold"
                  : `${styles.subtext} hover:${styles.heading} hover:opacity-80`
              }`}
            >
              Contact
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenPreferences}
            title="Open Preferences"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${styles.buttonSecondary}`}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </button>

          <button
            onClick={onOpenConsole}
            title="Open Developer API Playground"
            className="flex items-center gap-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/30 px-3 py-1.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition cursor-pointer font-medium"
          >
            <Terminal className="h-4 w-4" />
            <span className="hidden lg:inline">Developer Console</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3">
              <div className="hidden lg:block text-right">
                <span className={`block text-xs font-semibold ${styles.heading}`}>
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-sky-100 dark:bg-sky-950/50 px-1.5 py-0.5 text-3xs font-semibold text-sky-700 dark:text-sky-300 uppercase">
                  <UserCheck className="h-3 w-3" />
                  {currentUser.userTypeId === 1
                    ? "Candidate"
                    : currentUser.userTypeId === 2
                    ? "HR Manager"
                    : "Interviewer"}
                </span>
              </div>
              <button
                onClick={() => {
                  if (currentUser.userTypeId === 1) setActiveTab("candidate");
                  else if (currentUser.userTypeId === 2) setActiveTab("company");
                  else setActiveTab("interviewer");
                }}
                className={`flex h-9 items-center justify-center rounded-lg px-3.5 text-xs font-medium cursor-pointer transition border ${styles.buttonSecondary}`}
              >
                My Portal
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition cursor-pointer ${styles.buttonSecondary}`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3">
              <button
                onClick={() => setActiveTab("login")}
                className={`px-2.5 sm:px-3.5 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 ${styles.text}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className="rounded-lg bg-sky-600 px-2.5 sm:px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-sky-500 transition cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
