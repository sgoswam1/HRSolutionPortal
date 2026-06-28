import React, { useState, useEffect } from "react";
import { User, Job, Application, Interview } from "../types";
import {
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Phone,
  Key,
  HelpCircle,
  Send,
  RefreshCw,
  Calendar as CalendarIcon,
  Video,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Zap,
  Laptop,
  Info,
  Mic,
  Camera,
  ChevronLeft,
  BarChart3,
  UploadCloud,
  FileUp
} from "lucide-react";
import { usePreferences } from "../context/PreferencesContext";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

interface CandidateDashboardProps {
  currentUser: User;
  onRefreshUser: () => void;
}

export default function CandidateDashboard({ currentUser, onRefreshUser }: CandidateDashboardProps) {
  const { theme, styles, formatDateTime, formatCurrency } = usePreferences();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [ints, setInts] = useState<Interview[]>([]);
  const [activeTab, setActiveTab] = useState<"jobs" | "applications" | "calendar" | "analytics">("jobs");
  
  // Interactive UI
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [applying, setApplying] = useState<boolean>(false);

  // Gemini State
  const [cvText, setCvText] = useState<string>("");
  const [geminiResult, setGeminiResult] = useState<any | null>(null);
  const [loadingGemini, setLoadingGemini] = useState<boolean>(false);
  const [parsingFile, setParsingFile] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Interactive Virtual Lobby State
  const [activePrepSlot, setActivePrepSlot] = useState<Interview | null>(null);
  const [lobbyCam, setLobbyCam] = useState<boolean>(false);
  const [lobbyMic, setLobbyMic] = useState<boolean>(false);
  const [lobbyNotes, setLobbyNotes] = useState<string>("");
  const [lobbySubmittedText, setLobbySubmittedText] = useState<string>("");

  // Candidate Monthly Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedCalDateStr, setSelectedCalDateStr] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  const calendarYear = currentDate.getFullYear();
  const calendarMonth = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(calendarYear, calendarMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(calendarYear, calendarMonth + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedCalDateStr(new Date().toISOString().substring(0, 10));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchData = async () => {
    try {
      const [rJobs, rApps, rInts] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/applications"),
        fetch("/api/interviews")
      ]);
      if (rJobs.ok) setJobs(await rJobs.json());
      if (rApps.ok) {
        const allApps: Application[] = await rApps.json();
        setApps(allApps.filter(a => a.candidateId === currentUser.id));
      }
      if (rInts.ok) {
        const allInts: Interview[] = await rInts.json();
        // find interviews matched with candidate name
        setInts(allInts.filter(i => i.candidateName.toLowerCase().includes(currentUser.firstName.toLowerCase())));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    try {
      const res = await fetch("/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob.id,
          candidateId: currentUser.id,
          coverLetter,
          experience
        })
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: `Successfully applied for the position of ${selectedJob.title}!`, type: "success" }
        }));
        setSelectedJob(null);
        setCoverLetter("");
        setExperience("");
        setGeminiResult(null);
        fetchData();
        setActiveTab("applications");
      } else {
        const err = await res.json();
        window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: err.error || "Failed to submit application.", type: "error" }
        }));
      }
    } catch (e) {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Error submitting application.", type: "error" }
      }));
    } finally {
      setApplying(false);
    }
  };

  const handleRunGemini = async () => {
    if (!cvText) {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Please paste your resume or summary text first.", type: "info" }
      }));
      return;
    }
    if (!selectedJob) return;

    setLoadingGemini(true);
    setGeminiResult(null);
    try {
      const res = await fetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: cvText,
          jobDescription: selectedJob.description + " Skills expected: " + selectedJob.skills.join(", ")
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeminiResult(data);
      } else {
        window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: "Unable to process AI evaluation request.", type: "error" }
        }));
      }
    } catch (e) {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Error reaching server-side Gemini gateway.", type: "error" }
      }));
    } finally {
      setLoadingGemini(false);
    }
  };

  const handleFileChange = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Only PDF files are supported for resume parsing.", type: "error" }
      }));
      return;
    }

    setParsingFile(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(",")[1];
          
          const res = await fetch("/api/gemini/parse-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileBase64: base64String, fileName: file.name })
          });

          if (res.ok) {
            const data = await res.json();
            setCvText(data.extractedText || "");
            if (data.experienceSummary) {
              setExperience(data.experienceSummary);
            }
            window.dispatchEvent(new CustomEvent("show-toast", {
              detail: { message: `Successfully parsed resume for ${data.candidateName || "Candidate"}!`, type: "success" }
            }));
          } else {
            window.dispatchEvent(new CustomEvent("show-toast", {
              detail: { message: "Failed to parse resume PDF. Please paste manually or try again.", type: "error" }
            }));
          }
        } catch (innerErr) {
          console.error(innerErr);
          window.dispatchEvent(new CustomEvent("show-toast", {
            detail: { message: "Failed parsing PDF content.", type: "error" }
          }));
        } finally {
          setParsingFile(false);
        }
      };
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Error reading resume file.", type: "error" }
      }));
      setParsingFile(false);
    }
  };

  const handleLobbySubmitNotes = () => {
    if (!lobbyNotes.trim()) return;
    setLobbySubmittedText(lobbyNotes);
    setLobbyNotes("");
  };

  const filteredJobs = jobs.filter(
    j =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to generate calendar cells
  const getDaysInMonth = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevMonthObj = new Date(year, month - 1, dayNum);
      cells.push({
        dateStr: prevMonthObj.toISOString().substring(0, 10),
        dayNumber: dayNum,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const currentDayObj = new Date(year, month, i);
      const yyyy = currentDayObj.getFullYear();
      const mm = String(currentDayObj.getMonth() + 1).padStart(2, "0");
      const dd = String(currentDayObj.getDate()).padStart(2, "0");
      cells.push({
        dateStr: `${yyyy}-${mm}-${dd}`,
        dayNumber: i,
        isCurrentMonth: true
      });
    }

    // Next month days to pad to 42 cells
    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDayObj = new Date(year, month + 1, i);
      const yyyy = nextDayObj.getFullYear();
      const mm = String(nextDayObj.getMonth() + 1).padStart(2, "0");
      const dd = String(nextDayObj.getDate()).padStart(2, "0");
      cells.push({
        dateStr: `${yyyy}-${mm}-${dd}`,
        dayNumber: i,
        isCurrentMonth: false
      });
    }

    return cells;
  };

  const cells = getDaysInMonth(calendarYear, calendarMonth);
  const todayStr = new Date().toISOString().substring(0, 10);
  const selectedDayInterviews = ints.filter(
    i => i.dateTime && i.dateTime.substring(0, 10) === selectedCalDateStr
  );

  const formatReadableDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Metrics & Charts Calculations for Candidate
  const totalAppliedCount = apps.length;
  const interviewsCount = ints.length;
  const pendingInterviews = ints.filter(i => i.status === "Scheduled").length;
  
  const acceptedApps = apps.filter(a => a.status === "Accepted").length;
  const reviewApps = apps.filter(a => a.status === "Under Review").length;
  const scheduledApps = apps.filter(a => a.status === "Interview Scheduled").length;
  const rejectedApps = apps.filter(a => a.status === "Rejected").length;

  const appStatusData = [
    { name: "Applied", Count: apps.filter(a => a.status === "Applied").length, fill: "#3b82f6" },
    { name: "Under Review", Count: reviewApps, fill: "#0ea5e9" },
    { name: "Scheduled", Count: scheduledApps, fill: "#8b5cf6" },
    { name: "Accepted / Offers", Count: acceptedApps, fill: "#10b981" },
    { name: "Rejected", Count: rejectedApps, fill: "#ef4444" }
  ];

  const ratingSummaryData = ints.filter(i => i.evaluation).map(item => ({
    name: item.jobTitle.length > 15 ? item.jobTitle.substring(0, 12) + "..." : item.jobTitle,
    Technical: item.evaluation?.technicalScore || 0,
    "Soft Skills": item.evaluation?.softSkillsScore || 0,
    "Culture Fit": item.evaluation?.cultureFitScore || 0
  }));

  return (
    <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-200 ${styles.text}`}>
      {/* Page Header */}
      <div className={`mb-8 rounded-3xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200 ${styles.panel}`}>
        <div>
          <span className="text-xs font-semibold text-sky-600 font-mono uppercase tracking-wider">Candidate Workspace</span>
          <h1 className={`text-2xl font-bold font-sans tracking-tight mt-0.5 ${styles.heading}`}>
            Welcome Back, {currentUser.firstName}!
          </h1>
          <p className={`text-sm mt-1 ${styles.subtext}`}>
            Browse corporate openings, evaluate your skills fit using Gemini AI, and track interviews.
          </p>
        </div>

        <div className={`flex gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 text-2xs font-mono ${styles.border}`}>
          <div>
            <span className={`block font-sans font-semibold ${styles.subtext}`}>EMAIL SPEC</span>
            <span className={styles.text}>{currentUser.userEmail}</span>
          </div>
          <div>
            <span className={`block font-sans font-semibold ${styles.subtext}`}>CONTACT</span>
            <span className={styles.text}>{currentUser.contactNo}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 mb-8 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "jobs"
              ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          id="tab-candidate-jobs"
          type="button"
        >
          <Briefcase className="h-4 w-4" />
          Active Openings ({filteredJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "applications"
              ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          id="tab-candidate-applications"
          type="button"
        >
          <FileText className="h-4 w-4" />
          My Applications ({apps.length})
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "calendar"
              ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          id="tab-candidate-calendar"
          type="button"
        >
          <CalendarIcon className="h-4 w-4" />
          Interview Schedules ({ints.length})
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "analytics"
              ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          id="tab-candidate-analytics"
          type="button"
        >
          <BarChart3 className="h-4 w-4" />
          Selection Analytics
        </button>
      </div>

      {/* Tab: Jobs Openings */}
      {activeTab === "jobs" && (
        <div className={`rounded-3xl border p-6 transition-colors duration-200 ${styles.panel}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6 ${styles.border}`}>
            <div>
              <h2 className={`text-lg font-bold font-sans ${styles.heading}`}>Active Job Openings</h2>
              <p className={`text-xs ${styles.subtext}`}>Apply for verified openings and audit your technical keywords using Gemini AI.</p>
            </div>
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-xl border px-4 py-2 text-xs focus:outline-none focus:border-sky-500 w-full sm:max-w-xs transition ${styles.input}`}
            />
          </div>

          <div className={`divide-y ${styles.border}`}>
            {filteredJobs.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No match found for "{searchTerm}". Check back soon!
              </div>
            ) : (
              filteredJobs.map(job => {
                const applied = apps.some(a => a.jobId === job.id);
                return (
                  <div key={job.id} className={`py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b/10 ${styles.border}`}>
                    <div>
                      <h3 className={`font-bold text-sm hover:text-sky-600 transition cursor-pointer ${styles.heading}`} onClick={() => setSelectedJob(job)}>
                        {job.title}
                      </h3>
                      <p className={`text-xs font-medium mt-1 ${styles.subtext}`}>
                        {job.companyName} &bull; <span>{job.location}</span>
                      </p>
                      <p className={`mt-2 text-xs leading-relaxed line-clamp-2 max-w-xl ${styles.text}`}>
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills.map((skill, i) => (
                          <span key={i} className={`rounded-full px-2.5 py-0.5 text-3xs border ${styles.badge}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 text-right sm:self-center">
                      <span className="block font-mono text-3xs font-semibold text-emerald-650 dark:text-emerald-400 mb-2">{formatCurrency(job.salary)}</span>
                      {applied ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 text-2xs font-semibold text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900">
                          <CheckCircle className="h-3.5 w-3.5" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedJob(job)}
                          className={`rounded-lg px-3.5 py-1.5 text-2xs font-bold transition cursor-pointer ${styles.buttonSecondary}`}
                        >
                          Explore Position
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Applications */}
      {activeTab === "applications" && (
        <div className={`rounded-3xl border p-6 transition-all duration-300 relative overflow-hidden ${styles.panel}`}>
          {/* Top decorative line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"></div>
          
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-3xs font-bold text-sky-600 dark:text-sky-400 font-mono uppercase tracking-widest block mb-0.5">Pipeline Audit</span>
              <h2 className={`text-base font-extrabold font-sans tracking-tight ${styles.heading}`}>Submitted Tracks ({apps.length})</h2>
            </div>
            <span className="font-mono text-4xs bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-100/40 dark:border-sky-900/40 text-sky-700 dark:text-sky-300 font-bold">
              USER #{currentUser.id}
            </span>
          </div>

          {apps.length === 0 ? (
            <div className={`text-center py-10 border rounded-2xl text-xs flex flex-col items-center p-6 ${styles.border} bg-slate-50/5`}>
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800/60 mb-3 border border-slate-200/40 dark:border-slate-700/30">
                <Briefcase className="h-6 w-6 text-slate-400" />
              </div>
              <p className={`font-bold font-sans text-sm tracking-tight ${styles.heading}`}>No Submitted Applications</p>
              <p className={`text-3xs mt-1 text-center leading-relaxed max-w-xs ${styles.subtext}`}>
                You haven't submitted any job application profiles yet. Choose from our Active Openings and click Explore Position to apply.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {apps.map(app => {
                const getStageIndex = (status: string) => {
                  if (status === "Accepted" || status === "Rejected") return 4;
                  if (status === "Interview Scheduled") return 3;
                  if (status === "Under Review") return 2;
                  return 1;
                };

                const currentStage = getStageIndex(app.status);
                const isRejected = app.status === "Rejected";

                return (
                  <div 
                    key={app.id} 
                    className={`border rounded-2xl p-4 transition-all duration-200 hover:shadow-xs hover:scale-[1.01] ${styles.panel} bg-slate-50/5 hover:border-sky-300 dark:hover:border-sky-800`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div>
                        <h4 className={`font-extrabold text-sm tracking-tight ${styles.heading}`}>{app.jobTitle}</h4>
                        <p className={`text-3xs mt-0.5 font-medium ${styles.subtext}`}>{app.companyName}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-4xs font-black tracking-wide uppercase border ${
                        app.status === "Interview Scheduled"
                          ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900"
                          : app.status === "Accepted"
                          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                          : isRejected
                          ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900"
                          : "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900"
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Milestone Progress bar layout */}
                    <div className="mt-4 mb-3 bg-slate-100/30 dark:bg-slate-900/20 px-3 py-4 rounded-xl border border-slate-200/30 dark:border-slate-800/20">
                      <div className="relative flex items-center justify-between mb-2">
                        {/* Background line */}
                        <div className="absolute left-1 right-1 h-1 bg-slate-200 dark:bg-slate-800 -z-0 rounded-full"></div>
                        
                        {/* Filled Line */}
                        <div 
                          className={`absolute left-1 h-1 -z-0 transition-all duration-500 rounded-full ${
                            isRejected ? "bg-red-500" : "bg-sky-500"
                          }`}
                          style={{ 
                            width: `${((currentStage - 1) / 3) * 100}%` 
                          }}
                        ></div>

                        {/* Stepper Node Icons */}
                        {[1, 2, 3, 4].map((step) => {
                          const isCompleted = step < currentStage;
                          const isActive = step === currentStage;
                          const isStepRejected = isRejected && step === 4;

                          let dotBg = "bg-white dark:bg-[#0d131f] text-slate-400 border-slate-250 dark:border-slate-800";
                          let ringClass = "";

                          if (isCompleted) {
                            dotBg = "bg-sky-500 text-white border-sky-500";
                          } else if (isActive) {
                            if (isStepRejected) {
                              dotBg = "bg-red-500 text-white border-red-500";
                              ringClass = "ring-4 ring-red-500/20";
                            } else {
                              dotBg = "bg-indigo-600 text-white border-indigo-600";
                              ringClass = "ring-4 ring-indigo-500/20";
                            }
                          }

                          // Choose icon
                          let nodeIcon = null;
                          const iconClass = "h-3 w-3";
                          if (step === 1) nodeIcon = <FileText className={iconClass} />;
                          else if (step === 2) nodeIcon = <Sparkles className={iconClass} />;
                          else if (step === 3) nodeIcon = <Video className={iconClass} />;
                          else nodeIcon = <Award className={iconClass} />;

                          return (
                            <div 
                              key={step} 
                              className={`z-10 flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 ${dotBg} ${ringClass}`}
                              title={`Step ${step}`}
                            >
                              {isCompleted ? "✓" : nodeIcon}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between text-4xs font-mono font-bold uppercase tracking-wider px-0.5 mt-1">
                        <span className={currentStage >= 1 ? "text-sky-600 dark:text-sky-400 font-black" : "text-slate-400"}>Applied</span>
                        <span className={currentStage >= 2 ? "text-sky-600 dark:text-sky-400 font-black" : "text-slate-400"}>Screening</span>
                        <span className={currentStage >= 3 ? "text-sky-600 dark:text-sky-400 font-black" : "text-slate-400"}>Panel</span>
                        <span className={isRejected ? "text-red-500 font-black" : currentStage >= 4 ? "text-emerald-500 font-black" : "text-slate-400"}>Outcome</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-4xs font-mono mt-3.5 text-slate-400 bg-slate-100/20 dark:bg-slate-900/10 px-2 py-1.5 rounded-lg">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">SUBMITTAL ID: <strong className="font-mono text-indigo-600 dark:text-indigo-400">APP-00{app.id}</strong></span>
                      <span className="text-slate-400 font-medium">{formatDateTime(app.appliedOn)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Interview Schedules */}
      {activeTab === "calendar" && (
        <div className={`rounded-3xl border p-6 transition-colors duration-200 shadow-md ${styles.panel}`}>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs uppercase font-mono mb-1">
            <CalendarIcon className="h-4 w-4 text-sky-500" />
            Interview Schedule Planner & Calendar
          </div>
          <h2 className={`text-xl font-bold font-sans tracking-tight mb-2 ${styles.heading}`}>
            My Scheduled Interview Calendars
          </h2>
          <p className={`text-xs ${styles.subtext} mb-6`}>
            Select dates to verify system integrations, test audio/webcam hardware pipelines, or examine score feedbacks.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Calendar Grid */}
            <div className="lg:col-span-2 space-y-4">
              {/* Calendar Controls */}
              <div className="flex items-center justify-between border-b pb-4 mb-2 border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-4">
                  <h3 className={`text-sm font-bold font-sans ${styles.heading}`}>
                    {monthNames[calendarMonth]} {calendarYear}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevMonth}
                      className={`p-1.5 rounded-lg border transition cursor-pointer hover:bg-slate-500/5 ${styles.buttonSecondary}`}
                      title="Previous Month"
                      type="button"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className={`p-1.5 rounded-lg border transition cursor-pointer hover:bg-slate-500/5 ${styles.buttonSecondary}`}
                      title="Next Month"
                      type="button"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="hidden sm:flex items-center gap-3 text-[10px] font-semibold mr-2">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" /> Invitation</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Evaluated</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Delayed</span>
                  </div>
                  <button
                    onClick={goToday}
                    className={`px-3 py-1.5 rounded-lg text-2xs font-bold border transition cursor-pointer hover:bg-slate-500/5 ${styles.buttonSecondary}`}
                    type="button"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Weekdays Header */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="py-1">{day}</div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((cell, idx) => {
                  const dayInterviews = ints.filter(i => i.dateTime && i.dateTime.substring(0, 10) === cell.dateStr);
                  const isSelected = cell.dateStr === selectedCalDateStr;
                  const isToday = cell.dateStr === todayStr;

                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      onClick={() => {
                        setSelectedCalDateStr(cell.dateStr);
                      }}
                      type="button"
                      className={`min-h-[64px] p-1.5 rounded-xl border flex flex-col justify-between text-left transition cursor-pointer relative focus:outline-none ${
                        isSelected
                          ? "bg-sky-500/5 border-sky-500 ring-1 ring-sky-500/50"
                          : isToday
                          ? "bg-sky-500/5 border-sky-400 text-sky-600 dark:text-sky-400"
                          : cell.isCurrentMonth
                          ? "border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-500/5 text-slate-800 dark:text-slate-200"
                          : "border-slate-100 dark:border-slate-900 bg-slate-500/[0.01] hover:bg-slate-500/5 text-slate-400 dark:text-slate-600 opacity-60"
                      }`}
                    >
                      <span className={`text-2xs font-bold leading-none ${isToday ? "font-extrabold text-sky-600 dark:text-sky-400" : ""}`}>
                        {cell.dayNumber}
                      </span>

                      {/* Dots / Indicators */}
                      <div className="flex flex-wrap gap-1 mt-1.5 justify-start w-full">
                        {dayInterviews.slice(0, 3).map(intv => {
                          let dotColor = "bg-sky-500";
                          if (intv.status === "Delayed") dotColor = "bg-amber-500";
                          if (intv.status === "Completed") dotColor = "bg-emerald-500";
                          return (
                            <span
                              key={intv.id}
                              className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
                              title={`${intv.candidateName} - ${intv.status}`}
                            />
                          );
                        })}
                        {dayInterviews.length > 3 && (
                          <span className="text-[8px] font-bold text-slate-450 leading-none self-center">
                            +{dayInterviews.length - 3}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Specific Selected Day Panels Info */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${styles.border} bg-slate-500/[0.02]`}>
              <div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase mb-3">
                  <Clock className="h-3.5 w-3.5 text-sky-500" />
                  Invitation Details
                </div>
                
                <h4 className={`text-xs font-extrabold font-sans mb-1 ${styles.heading}`}>
                  {formatReadableDate(selectedCalDateStr)}
                </h4>
                <p className={`text-[10px] ${styles.subtext} mb-4`}>
                  Manage pre-interview hardware setup testing and check overall status evaluation notes.
                </p>

                {/* Interviews List */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {selectedDayInterviews.length === 0 ? (
                    <div className={`text-center py-10 ${styles.subtext} border border-dashed rounded-xl p-4 bg-slate-500/[0.01]`}>
                      <CalendarIcon className="h-7 w-7 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-2xs font-semibold">No Invitation Slots</p>
                      <p className="text-[10px] mt-1 opacity-70">Invitations scheduled for this date will appear here.</p>
                    </div>
                  ) : (
                    selectedDayInterviews.map(int => {
                      const isUpcoming = int.status === "Scheduled" || int.status === "Delayed";
                      const timeOnly = int.dateTime ? int.dateTime.substring(11, 16) : "00:00";
                      
                      return (
                        <div key={int.id} className={`p-3 rounded-xl border text-2xs ${styles.border} bg-white dark:bg-slate-900/30 shadow-2xs space-y-3.5`}>
                          <div className="flex justify-between items-start gap-1">
                            <div className="max-w-[70%]">
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 block truncate">{int.jobTitle}</span>
                              <span className={`block text-[10px] opacity-80 truncate ${styles.subtext}`}>Panel Chair: {int.interviewerName}</span>
                            </div>
                            
                            <span className={`rounded-md px-1.5 py-0.5 text-[8px] font-extrabold uppercase border shrink-0 ${
                              int.status === "Scheduled"
                                ? "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-200/50"
                                : int.status === "Delayed"
                                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/50"
                                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50"
                            }`}>
                              {int.status}
                            </span>
                          </div>

                          <div className="text-[10px] space-y-1 text-slate-500 dark:text-slate-400 border-t border-dashed border-slate-200/65 dark:border-slate-800/65 pt-1.5 font-mono">
                            <p className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <strong>Slot Time:</strong> <span className="bg-slate-500/5 px-1 py-0.5 rounded text-sky-600 dark:text-sky-400 font-bold">{timeOnly}</span>
                            </p>
                          </div>

                          {isUpcoming ? (
                            <button
                              onClick={() => {
                                setActivePrepSlot(int);
                                setLobbyCam(false);
                                setLobbyMic(false);
                                setLobbyNotes("");
                                setLobbySubmittedText("");
                              }}
                              className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-3xs transition hover:opacity-90 shadow-sm"
                              id={`btn-join-lobby-${int.id}`}
                              type="button"
                            >
                              <Video className="h-3.5 w-3.5" /> Join Virtual Lobby Test
                            </button>
                          ) : int.evaluation ? (
                            <div className="border rounded-xl p-2.5 bg-slate-50/10 space-y-2 border-emerald-200/50">
                              <span className="font-bold block text-[9px] uppercase tracking-wider text-emerald-600">Scores Feedback Card</span>
                              <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                                <div className="bg-emerald-500/10 p-1 rounded">
                                  <span className="block text-[8px] text-slate-400">TECH</span>
                                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-150">{int.evaluation.technicalScore}</span>
                                </div>
                                <div className="bg-purple-500/10 p-1 rounded">
                                  <span className="block text-[8px] text-slate-400">SOFT</span>
                                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-150">{int.evaluation.softSkillsScore || 8}</span>
                                </div>
                                <div className="bg-indigo-500/10 p-1 rounded">
                                  <span className="block text-[8px] text-slate-400">FIT</span>
                                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-150">{int.evaluation.cultureFitScore}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic text-center py-1">Evaluation feedback pending panelist submit...</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-400 flex items-center gap-1.5 justify-center leading-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                Live Systems Connected
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Selection Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fade-in">
          {/* Performance Metrics Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Submitted Proposals</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-sky-600 dark:text-sky-400`}>
                {totalAppliedCount}
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Total application profiles</p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Scheduled Invitations</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-purple-600 dark:text-purple-400`}>
                {interviewsCount}
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Invited panelist sessions</p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Offers / Accepted</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-emerald-600 dark:text-emerald-400`}>
                {acceptedApps}
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Successful role placements</p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Interviews Completion Rate</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-indigo-600 dark:text-indigo-400`}>
                {interviewsCount > 0 ? ((ints.filter(i => i.status === "Completed").length / interviewsCount) * 100).toFixed(0) : 0}%
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Evaluated sessions percent</p>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Chart 1: Applications Pipeline funnel Breakdown */}
            <div className={`rounded-3xl border p-5 ${styles.panel}`}>
              <div className="mb-3">
                <h4 className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.subtext}`}>Application Status Distribution</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Distribution of your submitted applications across recruitment pipeline steps.</p>
              </div>
              <div className="h-64">
                {totalAppliedCount === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-xs text-slate-400">
                    No submitted applications to chart.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                      <Bar dataKey="Count" radius={[4, 4, 0, 0]} barSize={32}>
                        {appStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Scores Profile over completed Panels */}
            <div className={`rounded-3xl border p-5 ${styles.panel}`}>
              <div className="mb-3">
                <h4 className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.subtext}`}>Interview Performance Scores</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Criteria rating feedback summaries received across evaluated interview sessions.</p>
              </div>
              <div className="h-64">
                {ratingSummaryData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-xs text-slate-400">
                    No completed evaluations on record.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingSummaryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} domain={[0, 10]} />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                      <Bar dataKey="Technical" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Soft Skills" fill="#a855f7" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Culture Fit" fill="#10b981" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Specification Detail & Application Slide Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className={`flex h-[85vh] w-full max-w-4xl flex-col rounded-3xl border shadow-2xl ${styles.panel}`}>
            <div className={`flex items-center justify-between border-b px-6 py-4 bg-slate-50/10 dark:bg-slate-900/40 rounded-t-3xl ${styles.border}`}>
              <div>
                <span className="text-2xs font-bold text-sky-600 dark:text-sky-400 uppercase font-mono">Apply Specification</span>
                <span className={`block text-base font-bold ${styles.heading}`}>{selectedJob.title}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setGeminiResult(null);
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${styles.buttonSecondary}`}
              >
                Close Spec
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-6">
              {/* Job Specification Description */}
              <div className={`space-y-4 border-r pr-0 md:pr-6 text-xs ${styles.border} ${styles.text}`}>
                <div>
                  <h4 className={`font-bold uppercase tracking-wider text-2xs mb-1 ${styles.heading}`}>Company Description</h4>
                  <p className={`leading-relaxed ${styles.text}`}>{selectedJob.description}</p>
                </div>

                <div>
                  <h4 className={`font-bold uppercase tracking-wider text-2xs mb-1 ${styles.heading}`}>Skills Desired</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedJob.skills.map((s, idx) => (
                      <span key={idx} className={`rounded border px-2 py-0.5 font-semibold text-3xs tracking-wide ${styles.badge}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-4 border bg-indigo-500/5 dark:bg-indigo-950/20 border-indigo-500/10 dark:border-indigo-900/50">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-2xs font-sans uppercase mb-2">
                    <Sparkles className="h-4 w-4" />
                    Gemini AI Skill Fit Assessment
                  </div>
                  <p className={`text-3xs leading-relaxed mb-3 ${styles.subtext}`}>
                    Paste your core CV/Resume text in the portal block opposite. Gemini will analyze keyword match ratings, formulate improvement areas, and suggest missing tech words!
                  </p>

                  {loadingGemini ? (
                    <div className="flex items-center gap-2 justify-center py-4 text-indigo-600 dark:text-indigo-400 font-bold font-mono text-3xs animate-pulse">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Auditing keywords ...
                    </div>
                  ) : geminiResult ? (
                    <div className={`space-y-3 mt-4 border-t pt-3 p-3 rounded-xl bg-slate-50/5 ${styles.border}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-3xs font-bold uppercase ${styles.subtext}`}>MATCH SCORE</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">{geminiResult.matchingScore}%</span>
                      </div>
                      <div className="w-full bg-slate-250 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${geminiResult.matchingScore}%` }}></div>
                      </div>

                      <div className="pt-2">
                        <span className="block text-3xs text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">SUGGESTED REPAIRS</span>
                        <ul className={`space-y-1 list-disc pl-4 text-3xs leading-relaxed ${styles.text}`}>
                          {geminiResult.improvements?.map((imp: string, i: number) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2">
                        <span className="block text-3xs text-amber-600 dark:text-amber-400 font-bold uppercase mb-1">MISSING SKILLS</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {geminiResult.missingKeywords?.map((k: string, i: number) => (
                            <span key={i} className={`rounded px-1.5 py-0.5 text-4xs font-mono border ${styles.badge}`}>
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Form Entry Field */}
              <div className="space-y-4 text-xs font-sans">
                <span className={`block font-bold uppercase tracking-widest text-2xs ${styles.subtext}`}>Application Parameters</span>

                {/* Real PDF Resume Parser Drag-and-Drop Area */}
                <div 
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition ${
                    isDraggingFile 
                      ? "border-indigo-500 bg-indigo-500/5" 
                      : "border-slate-200 dark:border-slate-800 bg-slate-500/[0.02]"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  {parsingFile ? (
                    <div className="flex flex-col items-center justify-center py-2 text-indigo-500 text-3xs font-bold font-mono animate-pulse gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                      <span>Parsing PDF file via Gemini Document AI...</span>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer select-none">
                      <UploadCloud className="h-6 w-6 text-slate-400 mb-1.5" />
                      <span className={`block font-bold text-3xs ${styles.heading}`}>
                        Upload your PDF Resume
                      </span>
                      <span className="block text-[10px] text-slate-450 mt-0.5">
                        Drag & drop a file here, or <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">browse file</span>
                      </span>
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileChange(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${styles.heading}`}>Quick Resume details (AI input/review text)</label>
                  <textarea
                    rows={4}
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border px-3 py-2 text-3xs font-mono focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 ${styles.input}`}
                    placeholder="Pasted Experience, tech stacks, or full CV details..."
                  />
                  <div className="text-right mt-1.5">
                    <button
                      type="button"
                      onClick={handleRunGemini}
                      disabled={loadingGemini}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-3xs font-bold transition cursor-pointer ${styles.buttonSecondary}`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Analyze Resume with Gemini AI
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${styles.heading}`}>Detailed Experience Overview</label>
                  <textarea
                    rows={2}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border px-3 py-2 focus:outline-none focus:border-sky-500 bg-white dark:bg-slate-900 ${styles.input}`}
                    placeholder="E.g. 5+ years building Spring/C# backends."
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${styles.heading}`}>Applicant Cover Letter</label>
                  <textarea
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border px-3 py-2 focus:outline-none focus:border-sky-500 bg-white dark:bg-slate-900 ${styles.input}`}
                    placeholder="Why are you a fantastic asset for this role?"
                  />
                </div>

                <div className={`pt-4 border-t ${styles.border}`}>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 py-3 font-semibold text-white disabled:opacity-50 transition cursor-pointer shadow-md shadow-indigo-600/10 dark:shadow-none"
                  >
                    <Send className="h-4 w-4" />
                    {applying ? "Submitting Application..." : "Submit Application"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Virtual Interview Lobby Modal */}
      {activePrepSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${styles.panel}`}>
            
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${styles.border} bg-slate-50/10`}>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900">
                  <Video className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-3xs font-bold text-purple-600 font-mono uppercase tracking-widest">Virtual Session Simulator</span>
                  <h3 className={`text-base font-bold font-sans leading-none mt-0.5 ${styles.heading}`}>Prep Lobby & Systems Check</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setActivePrepSlot(null);
                  setLobbyCam(false);
                  setLobbyMic(false);
                  setLobbyNotes("");
                  setLobbySubmittedText("");
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${styles.buttonSecondary}`}
              >
                Exit Lobby
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs leading-relaxed">
              
              {/* Interview Metadata Card */}
              <div className={`rounded-2xl border p-4 bg-slate-50/5 ${styles.border}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 border-b border-dashed border-slate-200 dark:border-slate-800 pb-3 mb-3">
                  <div>
                    <span className="text-4xs font-mono font-semibold text-slate-400">TARGET ROLE</span>
                    <h4 className={`text-sm font-bold mt-0.5 ${styles.heading}`}>{activePrepSlot.jobTitle}</h4>
                  </div>
                  <div>
                    <span className="text-4xs font-mono font-semibold text-slate-400">SESSION TIME</span>
                    <p className={`text-2xs font-semibold font-mono mt-0.5 ${styles.heading}`}>{formatDateTime(activePrepSlot.dateTime)}</p>
                  </div>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2 text-2xs">
                  <div className="flex items-start gap-2">
                    <Laptop className="h-4 w-4 text-purple-500 mt-0.5" />
                    <div>
                      <span className="block font-bold text-slate-400 text-3xs uppercase">Assigned Interviewer</span>
                      <span className={styles.text}>{activePrepSlot.interviewerName} (Architect Panelist)</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <span className="block font-bold text-slate-400 text-3xs uppercase">Preparation Mode</span>
                      <span className={styles.text}>Live WebRTC Session Simulator</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware / Media Streams Setup Panel */}
              <div className="space-y-3">
                <span className="block font-bold text-slate-400 uppercase tracking-widest text-3xs">Systems Integrity Diagnostics</span>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Camera Simulator */}
                  <div className={`rounded-xl border p-3 flex flex-col justify-between gap-3 ${styles.panel} bg-slate-50/10`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className={`h-4 w-4 ${lobbyCam ? "text-emerald-500" : "text-slate-400"}`} />
                        <span className={`font-semibold ${styles.heading}`}>Webcam Capture</span>
                      </div>
                      <span className={`h-2.5 w-2.5 rounded-full ${lobbyCam ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                    </div>

                    {lobbyCam ? (
                      <div className="h-24 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-sky-500/10 flex items-center justify-center">
                          <span className="text-white/40 font-mono text-4xs">LIVE BROADCAST FEED SIMULATION</span>
                        </div>
                        <span className="text-white text-3xs font-bold z-10 flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-sky-400" />
                          {currentUser.firstName} {currentUser.lastName}
                        </span>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                        <span className="text-slate-400 dark:text-slate-600 text-3xs">Camera is offline</span>
                      </div>
                    )}

                    <button
                      onClick={() => setLobbyCam(!lobbyCam)}
                      className={`w-full py-1.5 rounded-lg text-3xs font-bold transition cursor-pointer border ${
                        lobbyCam 
                          ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200" 
                          : "bg-sky-50 hover:bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900"
                      }`}
                    >
                      {lobbyCam ? "Disable Camera" : "Enable Web Camera"}
                    </button>
                  </div>

                  {/* Microphone Simulator */}
                  <div className={`rounded-xl border p-3 flex flex-col justify-between gap-3 ${styles.panel} bg-slate-50/10`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className={`h-4 w-4 ${lobbyMic ? "text-emerald-500" : "text-slate-400"}`} />
                        <span className={`font-semibold ${styles.heading}`}>Audio Microphone</span>
                      </div>
                      <span className={`h-2.5 w-2.5 rounded-full ${lobbyMic ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                    </div>

                    {lobbyMic ? (
                      <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex flex-col items-center justify-center p-3">
                        <div className="flex gap-1 items-end h-8">
                          <span className="w-1 bg-sky-500 rounded animate-pulse h-6 animate-duration-500"></span>
                          <span className="w-1 bg-sky-500 rounded animate-pulse h-4 animate-duration-300"></span>
                          <span className="w-1 bg-sky-500 rounded animate-pulse h-7 animate-duration-700"></span>
                          <span className="w-1 bg-sky-500 rounded animate-pulse h-3 animate-duration-400"></span>
                          <span className="w-1 bg-sky-500 rounded animate-pulse h-5 animate-duration-600"></span>
                        </div>
                        <span className="text-slate-400 dark:text-slate-500 text-4xs font-mono mt-2">Capturing decibel stream...</span>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                        <span className="text-slate-400 dark:text-slate-600 text-3xs">Microphone is muted</span>
                      </div>
                    )}

                    <button
                      onClick={() => setLobbyMic(!lobbyMic)}
                      className={`w-full py-1.5 rounded-lg text-3xs font-bold transition cursor-pointer border ${
                        lobbyMic 
                          ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200" 
                          : "bg-sky-50 hover:bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900"
                      }`}
                    >
                      {lobbyMic ? "Mute Microphone" : "Unmute Microphone"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lobby Interactive Notes Panel */}
              <div className="space-y-3 pt-2">
                <span className="block font-bold text-slate-400 uppercase tracking-widest text-3xs">Lobby Interactive Notepad</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lobbyNotes}
                    onChange={(e) => setLobbyNotes(e.target.value)}
                    placeholder="Type pre-interview reference notes or cheat-sheets..."
                    className={`flex-1 rounded-xl border px-3 py-2 text-xs focus:outline-none bg-white dark:bg-slate-900 focus:border-sky-500 ${styles.input}`}
                  />
                  <button
                    onClick={handleLobbySubmitNotes}
                    className="rounded-xl bg-sky-600 hover:bg-sky-500 font-bold px-4 py-2 text-white text-3xs cursor-pointer transition shrink-0"
                  >
                    Save Notes
                  </button>
                </div>

                {lobbySubmittedText && (
                  <div className="p-3 rounded-xl border bg-yellow-500/5 border-yellow-500/10 text-[11px] leading-relaxed italic text-slate-600 dark:text-slate-350">
                    <strong>Persistent Cheat-Sheet:</strong> "{lobbySubmittedText}"
                  </div>
                )}
              </div>

              {/* Quick instructions alert */}
              <div className="rounded-xl bg-sky-500/5 p-3 border border-sky-500/10 flex items-start gap-2.5 text-slate-500 dark:text-slate-400 text-3xs leading-normal">
                <Info className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                <p>
                  You are inside a sandboxed WebRTC simulator. Testing webcam frames or checking microphone decibel signals prepares your workstation environment before entering real panel links.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
