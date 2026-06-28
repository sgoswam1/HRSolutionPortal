import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Welcome from "./components/Welcome";
import DeveloperConsole from "./components/DeveloperConsole";
import CandidateDashboard from "./components/CandidateDashboard";
import CompanyDashboard from "./components/CompanyDashboard";
import InterviewerDashboard from "./components/InterviewerDashboard";
import PreferencesModal from "./components/PreferencesModal";
import { usePreferences } from "./context/PreferencesContext";
import { User, UserType } from "./types";
import { Briefcase, Key, ShieldCheck, Mail, AlertCircle, RefreshCw, Layers, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("welcome");
  const [showConsole, setShowConsole] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const { styles } = usePreferences();

  // Custom toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: "success" | "error" | "info" }>;
      setToast(customEvent.detail);
      
      clearTimeout(timer);
      timer = setTimeout(() => {
        setToast(null);
      }, 4000);
    };
    window.addEventListener("show-toast", handleToast);
    return () => {
      window.removeEventListener("show-toast", handleToast);
      clearTimeout(timer);
    };
  }, []);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form states - Register
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regContact, setRegContact] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regUserTypeId, setRegUserTypeId] = useState<number>(1);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [regError, setRegError] = useState("");
  const [emailCheckResult, setEmailCheckResult] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Form states - Reset Password
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Fetch available user types from server on startup
  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const res = await fetch("/api/users/getUserTypes/");
        if (res.ok) {
          const types = await res.json();
          setUserTypes(types);
        }
      } catch (err) {
        console.error("Failed to load user types from backend", err);
      }
    };
    fetchUserTypes();

    // Recover persisted session if present
    const savedEmail = localStorage.getItem("hr_user_email");
    if (savedEmail) {
      handleSilentRestore(savedEmail);
    }
  }, []);

  const handleSilentRestore = async (email: string) => {
    try {
      const res = await fetch("/api/users/getCurrentUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email })
      });
      if (res.ok) {
        const u = await res.json();
        setCurrentUser(u);
        // Route to the appropriate default portal tab
        if (u.userTypeId === 1) setActiveTab("candidate");
        else if (u.userTypeId === 2) setActiveTab("company");
        else setActiveTab("interviewer");
      } else {
        localStorage.removeItem("hr_user_email");
      }
    } catch {
      localStorage.removeItem("hr_user_email");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter email and password credentials.");
      return;
    }
    setLoginError("");
    setIsLoggingIn(true);

    try {
      // 1. Validate credentials via endpoint: POST /api/users/validateUser/
      const validateRes = await fetch("/api/users/validateUser/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: loginEmail, password: loginPassword })
      });

      if (!validateRes.ok) {
        throw new Error("Unable to contact verification endpoint.");
      }

      const isValid = await validateRes.json();
      if (isValid) {
        // 2. Fetch full user representation to persist in local state
        const userRes = await fetch("/api/users/getCurrentUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: loginEmail })
        });

        if (userRes.ok) {
          const matchedUser: User = await userRes.json();
          setCurrentUser(matchedUser);
          localStorage.setItem("hr_user_email", matchedUser.userEmail);
          
          setLoginEmail("");
          setLoginPassword("");

          // Render appropriate dashboard tab
          if (matchedUser.userTypeId === 1) setActiveTab("candidate");
          else if (matchedUser.userTypeId === 2) setActiveTab("company");
          else setActiveTab("interviewer");
        } else {
          setLoginError("Credentials valid but failed to load user payload.");
        }
      } else {
        setLoginError("Invalid combination of user email and password.");
      }
    } catch (err: any) {
      setLoginError(err.message || "An authentication error occurred.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickLogin = async (email: string) => {
    // 1. Reset user state first to prevent stale screens/details and blank page guards
    setCurrentUser(null);
    localStorage.removeItem("hr_user_email");
    setLoginEmail(email);
    setLoginPassword("password123");
    setLoginError("");
    setIsLoggingIn(true);
    setActiveTab("login");

    try {
      // 1. Validate credentials via endpoint: POST /api/users/validateUser/
      const validateRes = await fetch("/api/users/validateUser/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email, password: "password123" })
      });

      if (!validateRes.ok) {
        throw new Error("Unable to contact verification endpoint.");
      }

      const isValid = await validateRes.json();
      if (isValid) {
        // 2. Fetch full user representation to persist in local state
        const userRes = await fetch("/api/users/getCurrentUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: email })
        });

        if (userRes.ok) {
          const matchedUser: User = await userRes.json();
          setCurrentUser(matchedUser);
          localStorage.setItem("hr_user_email", matchedUser.userEmail);
          
          setLoginEmail("");
          setLoginPassword("");

          // Render appropriate dashboard tab
          if (matchedUser.userTypeId === 1) setActiveTab("candidate");
          else if (matchedUser.userTypeId === 2) setActiveTab("company");
          else setActiveTab("interviewer");
        } else {
          setLoginError("Credentials valid but failed to load user payload.");
        }
      } else {
        setLoginError("Invalid combination of user email and password.");
      }
    } catch (err: any) {
      setLoginError(err.message || "An authentication error occurred.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    
    if (!regFirstName || !regLastName || !regEmail || !regContact || !regPassword) {
      setRegError("All registration fields are required.");
      return;
    }

    setIsRegistering(true);
    try {
      // Direct POST API /api/users/registerUser/
      const res = await fetch("/api/users/registerUser/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: regEmail,
          password: regPassword,
          userTypeId: regUserTypeId,
          firstName: regFirstName,
          lastName: regLastName,
          contactNo: regContact
        })
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("show-toast", { 
          detail: { message: "Registration complete! You can sign in now.", type: "success" } 
        }));
        
        // Clean fields
        setRegFirstName("");
        setRegLastName("");
        setRegEmail("");
        setRegContact("");
        setRegPassword("");
        setRegUserTypeId(1);
        setEmailCheckResult("");

        setActiveTab("login");
      } else {
        const errorData = await res.json();
        setRegError(errorData.error || "Failed to create registration.");
      }
    } catch (err: any) {
      setRegError(err.message || "An error occurred during account creation.");
    } finally {
      setIsRegistering(false);
    }
  };

  // Real-time backend Email existence checker during registration
  const handleEmailCheck = async (email: string) => {
    setRegEmail(email);
    if (!email || !email.includes("@")) {
      setEmailCheckResult("");
      return;
    }

    try {
      const res = await fetch("/api/users/userEmailAlreadyExists/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email })
      });
      if (res.ok) {
        const exists = await res.json();
        if (exists) {
          setEmailCheckResult("warning_exists");
        } else {
          setEmailCheckResult("valid");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");
    if (!resetEmail || !resetPassword) {
      setResetMessage("All input fields are required.");
      return;
    }
    setIsResetting(true);

    try {
      const res = await fetch("/api/users/resetPassword/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: resetEmail, password: resetPassword })
      });

      if (res.ok) {
        const success = await res.json();
        if (success) {
          window.dispatchEvent(new CustomEvent("show-toast", { 
            detail: { message: "Reset Complete! Your password has been successfully updated.", type: "success" } 
          }));
          setResetEmail("");
          setResetPassword("");
          setActiveTab("login");
        } else {
          setResetMessage("User email not found in the HR Solutions registry.");
        }
      }
    } catch (err) {
      setResetMessage("Failed to reset password.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("hr_user_email");
    setActiveTab("welcome");
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${styles.bg}`}>
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConsole={() => setShowConsole(true)}
        onOpenPreferences={() => setShowPreferences(true)}
      />

      <main className="flex-1 w-full mx-auto max-w-7xl">
        
        {/* LANDING / OVERVIEW */}
        {activeTab === "welcome" && (
          <Welcome
            currentUser={currentUser}
            onQuickLogin={handleQuickLogin}
            activeSection="welcome"
            onRegisterClick={() => setActiveTab("register")}
          />
        )}

        {/* ABOUT (Ported from About.cshtml, detailed architecture specs) */}
        {activeTab === "about" && (
          <Welcome
            currentUser={currentUser}
            onQuickLogin={handleQuickLogin}
            activeSection="about"
            onRegisterClick={() => setActiveTab("register")}
          />
        )}

        {/* CONTACT (Ported from Contact.cshtml details) */}
        {activeTab === "contact" && (
          <Welcome
            currentUser={currentUser}
            onQuickLogin={handleQuickLogin}
            activeSection="contact"
            onRegisterClick={() => setActiveTab("register")}
          />
        )}

        {/* PORTAL DASHBOARDS */}
        {currentUser && (
          <>
            {activeTab === "candidate" && currentUser.userTypeId === 1 && (
              <CandidateDashboard currentUser={currentUser} onRefreshUser={() => handleSilentRestore(currentUser.userEmail)} />
            )}
            {activeTab === "company" && currentUser.userTypeId === 2 && (
              <CompanyDashboard currentUser={currentUser} />
            )}
            {activeTab === "interviewer" && currentUser.userTypeId === 3 && (
              <InterviewerDashboard currentUser={currentUser} />
            )}
          </>
        )}

        {/* ACCOUNT ACCESS: LOGIN */}
        {activeTab === "login" && !currentUser && (
          <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
            <div className={`p-8 ${styles.panel}`}>
              <div className="text-center mb-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-xs">
                  <Key className="h-6 w-6" />
                </span>
                <h1 className={`mt-4 font-sans text-xl font-extrabold tracking-tight ${styles.heading}`}>
                  User Account Login
                </h1>
                <p className={`mt-1.5 text-xs ${styles.subtext}`}>
                  Enter your credentials matching registered user spec listings.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className={`block font-semibold mb-1 ${styles.subtext}`}>Account User Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="candidate@demo.com"
                    className={`mt-1 w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none ${styles.input}`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${styles.subtext}`}>User Account Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="password123"
                    className={`mt-1 w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none ${styles.input}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`flex w-full items-center justify-center gap-1 py-3 rounded-xl disabled:opacity-50 ${styles.buttonPrimary}`}
                >
                  {isLoggingIn ? "Authenticating user..." : "Account Access Sign In"}
                </button>
              </form>

              <div className={`mt-6 border-t pt-4 flex items-center justify-between text-3xs font-semibold ${styles.border}`}>
                <button onClick={() => setActiveTab("forgot")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer">
                  Forgot Password?
                </button>
                <button onClick={() => setActiveTab("register")} className="hover:text-indigo-650 dark:hover:text-indigo-300 text-indigo-600 dark:text-indigo-400 font-bold transition cursor-pointer">
                  Register with us &raquo;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT ACCESS: COMPREHENSIVE REGISTRATION (UserDetailsViewModel replica) */}
        {activeTab === "register" && !currentUser && (
          <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
            <div className={`p-8 ${styles.panel}`}>
              <div className="text-center mb-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-xs">
                  <Layers className="h-6 w-6" />
                </span>
                <h1 className={`mt-4 font-sans text-xl font-extrabold tracking-tight ${styles.heading}`}>
                  Portal Registration
                </h1>
                <p className={`mt-1.5 text-xs ${styles.subtext}`}>
                  Enroll into our recruitment registry database (performs live email exist checks).
                </p>
              </div>

              {regError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                {/* User Type Choice */}
                <div>
                  <label className={`block font-semibold mb-1 ${styles.subtext}`}>Workflow Role Type</label>
                  <select
                    value={regUserTypeId}
                    onChange={(e) => setRegUserTypeId(Number(e.target.value))}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none ${styles.input}`}
                  >
                    {userTypes.map(t => (
                      <option key={t.UserTypeId} value={t.UserTypeId} className="text-slate-900 bg-white">
                        {t.UserTypeDesc} ({t.UserTypeCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block font-semibold mb-1 ${styles.subtext}`}>First Name</label>
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Alex"
                      className={`mt-1 w-full rounded-xl border px-3.5 py-2 text-xs focus:outline-none ${styles.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block font-semibold mb-1 ${styles.subtext}`}>Last Name</label>
                    <input
                      type="text"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Candidate"
                      className={`mt-1 w-full rounded-xl border px-3.5 py-2 text-xs focus:outline-none ${styles.input}`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`font-semibold ${styles.subtext}`}>Email Address (Requires uniqueness)</label>
                    {emailCheckResult === "warning_exists" && (
                      <span className="text-3xs text-red-500 font-bold">Email already exists on backend</span>
                    )}
                    {emailCheckResult === "valid" && (
                      <span className="text-3xs text-emerald-600 font-bold">Valid & Unique</span>
                    )}
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => handleEmailCheck(e.target.value)}
                    placeholder="candidate_portal@demomaster.com"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none ${styles.input} ${
                      emailCheckResult === "warning_exists" ? "border-red-400 focus:border-red-400 text-red-900 dark:text-red-300" : ""
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block font-semibold mb-1 ${styles.subtext}`}>Contact Number</label>
                    <input
                      type="text"
                      required
                      value={regContact}
                      onChange={(e) => setRegContact(e.target.value)}
                      placeholder="e.g. 5550219"
                      className={`mt-1 w-full rounded-xl border px-3.5 py-2 text-xs focus:outline-none ${styles.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block font-semibold mb-1 ${styles.subtext}`}>Access Password</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="e.g. securePass1"
                      className={`mt-1 w-full rounded-xl border px-3.5 py-2 text-xs focus:outline-none ${styles.input}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering || emailCheckResult === "warning_exists"}
                  className={`flex w-full items-center justify-center gap-1 py-3 rounded-xl disabled:opacity-50 ${styles.buttonPrimary}`}
                >
                  {isRegistering ? "Registering account..." : "Submit New registration Account"}
                </button>
              </form>

              <div className={`mt-6 border-t pt-4 text-center ${styles.border}`}>
                <button onClick={() => setActiveTab("login")} className="text-xs text-indigo-650 dark:text-indigo-400 font-medium hover:underline transition cursor-pointer">
                  Already have an account? Sign In &raquo;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD RESET CONTAINER */}
        {activeTab === "forgot" && !currentUser && (
          <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
            <div className={`p-8 ${styles.panel}`}>
              <div className="text-center mb-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 shadow-xs">
                  <Mail className="h-6 w-6" />
                </span>
                <h1 className={`mt-4 font-sans text-xl font-extrabold tracking-tight ${styles.heading}`}>
                  Reset Password Setup
                </h1>
                <p className={`mt-1.5 text-xs ${styles.subtext}`}>
                  Simulates resetting registered credentials directly in-memory.
                </p>
              </div>

              {resetMessage && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0 text-yellow-500" />
                  <span>{resetMessage}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
                <div>
                  <label className={`block font-semibold mb-1 ${styles.subtext}`}>Account User Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="candidate@demo.com"
                    className={`mt-1 w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none ${styles.input}`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${styles.subtext}`}>Enter New Password</label>
                  <input
                    type="password"
                    required
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="new_password_1"
                    className={`mt-1 w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none ${styles.input}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className={`flex w-full items-center justify-center gap-1 py-3 rounded-xl disabled:opacity-50 ${styles.buttonPrimary}`}
                >
                  {isResetting ? "Updating server database..." : "Account Reset Password"}
                </button>
              </form>

              <div className={`mt-6 border-t pt-4 text-center ${styles.border}`}>
                <button onClick={() => setActiveTab("login")} className="text-xs text-indigo-650 dark:text-indigo-400 font-medium hover:underline transition cursor-pointer">
                  Remember password? Access Login &raquo;
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className={`border-t py-6 transition-colors duration-200 ${styles.navbar}`}>
        <div className={`mx-auto max-w-7xl px-4 text-center text-xs font-sans ${styles.subtext}`}>
          HR Solutions Portal Integration System &bull; Derived from sgoswam1/HRSolutionsApplication &bull; © 2026
        </div>
      </footer>

      {/* DEVELOPER PLAYGROUND CONSOLE */}
      {showConsole && (
        <DeveloperConsole onClose={() => setShowConsole(false)} />
      )}

      {/* USER PREFERENCES MODAL */}
      {showPreferences && (
        <PreferencesModal onClose={() => setShowPreferences(false)} />
      )}

      {/* GLOBAL FLOATING TOAST NOTIFICATIONS */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs max-w-sm animate-fade-in">
          {toast.type === "success" ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
          ) : toast.type === "error" ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500 shrink-0">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
              <Info className="h-4.5 w-4.5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-3xs sm:text-2xs font-semibold leading-normal text-slate-800 dark:text-slate-200">
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast(null)} 
            className="text-slate-450 hover:text-slate-600 dark:hover:text-slate-200 text-3xs font-mono font-bold cursor-pointer ml-1 select-none"
            type="button"
          >
            ✕
          </button>
        </div>
      )}
      <Analytics />
    </div>
  );
}
