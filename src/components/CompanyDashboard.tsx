import React, { useState, useEffect } from "react";
import { User, Job, Application, Interview } from "../types";
import { 
  Users, 
  FileText, 
  Calendar, 
  PlusCircle, 
  Check, 
  X, 
  ClipboardList, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Clock,
  RefreshCw,
  Trash2,
  CalendarDays,
  AlertCircle,
  BarChart3,
  PieChart as LucidePieChart,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { usePreferences } from "../context/PreferencesContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

interface CompanyDashboardProps {
  currentUser: User;
}

export default function CompanyDashboard({ currentUser }: CompanyDashboardProps) {
  const { styles, formatDateTime } = usePreferences();
  const [activeTab, setActiveTab] = useState<"applicants" | "calendar" | "publish" | "analytics">("applicants");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [ints, setInts] = useState<Interview[]>([]);
  const [interviewers, setInterviewers] = useState<User[]>([]);

  // Filter states
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterJob, setFilterJob] = useState("All");

  // Event Calendar states
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedCalDateStr, setSelectedCalDateStr] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  });

  // Calendar inline editing
  const [editingInterviewId, setEditingInterviewId] = useState<number | null>(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState("");

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Scheduling states
  const [activeAppToSchedule, setActiveAppToSchedule] = useState<Application | null>(null);
  const [selectedInterviewerId, setSelectedInterviewerId] = useState("");
  const [dateTimeStr, setDateTimeStr] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const fetchData = async () => {
    try {
      const [rJobs, rApps, rInts, rAllUsers] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/applications"),
        fetch("/api/interviews"),
        fetch("/api/admin/users")
      ]);
      if (rJobs.ok) setJobs(await rJobs.json());
      if (rApps.ok) setApps(await rApps.json());
      if (rInts.ok) setInts(await rInts.json());
      if (rAllUsers.ok) {
        const uList: User[] = await rAllUsers.json();
        // userTypeId 3 is interviewers
        setInterviewers(uList.filter(u => u.userTypeId === 3));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCSV = () => {
    if (apps.length === 0) {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "No application data available to export.", type: "info" }
      }));
      return;
    }

    // Build headers
    const headers = [
      "Application ID",
      "Candidate Name",
      "Candidate Email",
      "Job Opening Title",
      "Status Stage",
      "Candidate Experience Summary",
      "Estimated Years Exp",
      "Technical Score (/10)",
      "Communication Score (/10)",
      "Culture Fit Score (/10)",
      "Assigned Panelist",
      "Evaluation Status",
      "Panelist Evaluation Notes",
      "Applied On Date"
    ];

    // Build rows
    const rows = apps.map(app => {
      const matchingIntv = ints.find(i => i.applicationId === app.id);
      
      const id = app.id;
      const name = `"${app.candidateName.replace(/"/g, '""')}"`;
      const email = `"${app.candidateEmail.replace(/"/g, '""')}"`;
      const jobTitle = `"${app.jobTitle.replace(/"/g, '""')}"`;
      const status = app.status;
      const expSum = app.experience ? `"${app.experience.replace(/"/g, '""')}"` : "N/A";
      const yearsExp = app.experience ? (app.experience.match(/\d+/) ? app.experience.match(/\d+/)![0] : "N/A") : "N/A";
      
      const techScore = matchingIntv?.evaluation?.technicalScore ?? "N/A";
      const softScore = matchingIntv?.evaluation?.softSkillsScore ?? "N/A";
      const cultureScore = matchingIntv?.evaluation?.cultureFitScore ?? "N/A";
      const interviewer = matchingIntv?.interviewerName ? `"${matchingIntv.interviewerName.replace(/"/g, '""')}"` : "Not Assigned";
      const intvStatus = matchingIntv?.status ?? "Not Scheduled";
      const notes = matchingIntv?.evaluation?.notes ? `"${matchingIntv.evaluation.notes.replace(/"/g, '""')}"` : "N/A";
      const appliedDate = app.appliedOn || "N/A";

      return [
        id,
        name,
        email,
        jobTitle,
        status,
        expSum,
        yearsExp,
        techScore,
        softScore,
        cultureScore,
        interviewer,
        intvStatus,
        notes,
        appliedDate
      ];
    });

    // Create CSV payload
    const csvString = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    try {
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `recruitment_funnel_report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Pipeline report exported to CSV successfully!", type: "success" }
      }));
    } catch (err: any) {
      console.error(err);
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Error generating CSV download asset.", type: "error" }
      }));
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSalary || !newDesc) {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Please complete required job details.", type: "info" }
      }));
      return;
    }
    setIsPosting(true);
    try {
      const skillArr = newSkills
        ? newSkills.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          salary: newSalary,
          location: newLoc || "Remote",
          description: newDesc,
          skills: skillArr,
          companyName: "HRSolutions Corp"
        })
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: "New job opening published successfully.", type: "success" }
        }));
        setNewTitle("");
        setNewSalary("");
        setNewLoc("");
        setNewDesc("");
        setNewSkills("");
        fetchData();
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Error posting job position.", type: "error" }
      }));
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdateStatus = async (appId: number, nextStatus: string) => {
    try {
      const res = await fetch("/api/applications/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, status: nextStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppToSchedule || !selectedInterviewerId || !dateTimeStr) {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Please check interviewer selection and schedule date.", type: "info" }
      }));
      return;
    }
    setIsScheduling(true);
    try {
      const res = await fetch("/api/interviews/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: activeAppToSchedule.id,
          interviewerId: Number(selectedInterviewerId),
          dateTime: dateTimeStr
        })
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: "Recruitment panels and slot scheduled successfully!", type: "success" }
        }));
        setActiveAppToSchedule(null);
        setSelectedInterviewerId("");
        setDateTimeStr("");
        fetchData();
      }
    } catch (e) {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Error scheduling panel.", type: "error" }
      }));
    } finally {
      setIsScheduling(false);
    }
  };

  const handleUpdateInterview = async (interviewId: number, nextStatus?: string, nextDateTime?: string) => {
    try {
      const res = await fetch("/api/interviews/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId, status: nextStatus, dateTime: nextDateTime })
      });
      if (res.ok) {
        setEditingInterviewId(null);
        fetchData();
      } else {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: data.error || "Error updating interview.", type: "error" }
        }));
      }
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Network error updating interview.", type: "error" }
      }));
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = 
      app.candidateName.toLowerCase().includes(filterSearch.toLowerCase()) || 
      app.candidateEmail.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesJob = filterJob === "All" || app.jobTitle === filterJob;
    const matchesStatus = filterStatus === "All" || app.status === filterStatus;
    return matchesSearch && matchesJob && matchesStatus;
  });

  const allJobTitles = Array.from(new Set([
    ...jobs.map(j => j.title),
    ...apps.map(a => a.jobTitle)
  ])).filter(Boolean);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const todayStr = new Date().toISOString().substring(0, 10);

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const goToday = () => {
    const d = new Date();
    setCalendarMonth(d.getMonth());
    setCalendarYear(d.getFullYear());
    const pad = (n: number) => n.toString().padStart(2, "0");
    setSelectedCalDateStr(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  const formatReadableDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const padZero = (n: number) => n.toString().padStart(2, "0");
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

  const cells: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = calendarMonth === 0 ? 11 : calendarMonth - 1;
    const prevY = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
    cells.push({
      dayNumber: d,
      dateStr: `${prevY}-${padZero(prevM + 1)}-${padZero(d)}`,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      dayNumber: d,
      dateStr: `${calendarYear}-${padZero(calendarMonth + 1)}-${padZero(d)}`,
      isCurrentMonth: true
    });
  }

  // Next month padding
  const totalCells = cells.length;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let d = 1; d <= remaining; d++) {
    const nextM = calendarMonth === 11 ? 0 : calendarMonth + 1;
    const nextY = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
    cells.push({
      dayNumber: d,
      dateStr: `${nextY}-${padZero(nextM + 1)}-${padZero(d)}`,
      isCurrentMonth: false
    });
  }

  const selectedDayInterviews = ints.filter(i => i.dateTime && i.dateTime.substring(0, 10) === selectedCalDateStr);

  return (
    <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-200 ${styles.text}`}>
      {/* Header Info */}
      <div className={`mb-8 rounded-3xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200 ${styles.panel}`}>
        <div>
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 font-mono uppercase tracking-wider">Corporate Hub workspace</span>
          <h1 className={`text-2xl font-bold font-sans tracking-tight mt-0.5 ${styles.heading}`}>
            Recruiting Management Panel
          </h1>
          <p className={`text-sm mt-1 ${styles.subtext}`}>
            Author job criteria, examine in-bound candidates, and allocate panels to active interviewers.
          </p>
        </div>

        <div className={`flex gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 text-2xs font-mono ${styles.border}`}>
          <div>
            <span className={`block font-sans font-semibold ${styles.subtext}`}>COMPANY</span>
            <span className={styles.text}>HRSolutions Corp</span>
          </div>
          <div>
            <span className={`block font-sans font-semibold ${styles.subtext}`}>ROLE SPEC</span>
            <span className={styles.text}>Administrators</span>
          </div>
        </div>
      </div>

      {/* Bento Stats row */}
      <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className={`rounded-2xl border p-6 transition-colors duration-200 ${styles.panel}`}>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className={`text-xs font-semibold ${styles.subtext}`}>Total Postings</span>
            <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <span className={`block text-2xl font-bold mt-2 font-mono ${styles.heading}`}>{jobs.length}</span>
        </div>

        <div className={`rounded-2xl border p-6 transition-colors duration-200 ${styles.panel}`}>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className={`text-xs font-semibold ${styles.subtext}`}>Applicants Count</span>
            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className={`block text-2xl font-bold mt-2 font-mono ${styles.heading}`}>{apps.length}</span>
        </div>

        <div className={`rounded-2xl border p-6 transition-colors duration-200 ${styles.panel}`}>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className={`text-xs font-semibold ${styles.subtext}`}>Active Schedules</span>
            <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className={`block text-2xl font-bold mt-2 font-mono ${styles.heading}`}>{ints.filter(i => i.status === "Scheduled").length}</span>
        </div>

        <div className={`rounded-2xl border p-6 transition-colors duration-200 ${styles.panel}`}>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className={`text-xs font-semibold ${styles.subtext}`}>Evaluations Completed</span>
            <ClipboardList className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className={`block text-2xl font-bold mt-2 font-mono ${styles.heading}`}>{ints.filter(i => i.status === "Completed").length}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 mb-8 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("applicants")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "applicants"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          type="button"
        >
          <Users className="h-4 w-4" />
          Applicant Pipeline ({filteredApps.length})
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "calendar"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          type="button"
        >
          <CalendarDays className="h-4 w-4" />
          Recruiting Calendar ({ints.length})
        </button>
        <button
          onClick={() => setActiveTab("publish")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "publish"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          type="button"
        >
          <PlusCircle className="h-4 w-4" />
          Publish a Job
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "analytics"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          type="button"
        >
          <BarChart3 className="h-4 w-4" />
          Visual Analytics
        </button>
      </div>

      {/* Tab: Applicant Pipeline */}
      {activeTab === "applicants" && (
        <div className="space-y-6">
          <div className={`rounded-3xl border p-6 transition-colors duration-200 ${styles.panel}`}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className={`text-lg font-bold font-sans ${styles.heading}`}>In-bound Applicant Pipelines</h2>
                <p className={`text-xs ${styles.subtext}`}>Screen new applications, schedule interviews, and evaluate talent.</p>
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 rounded-lg font-mono">
                Showing {filteredApps.length} of {apps.length} applicants
              </div>
            </div>
            
            {/* Filter controls */}
            <div className={`mb-6 p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-center justify-between text-xs bg-slate-500/5 ${styles.border}`}>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate name or email..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 ${styles.input}`}
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Job:</span>
                  <select
                    value={filterJob}
                    onChange={(e) => setFilterJob(e.target.value)}
                    className={`rounded-xl border px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 ${styles.input}`}
                  >
                    <option value="All">All Jobs</option>
                    {allJobTitles.map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`rounded-xl border px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 ${styles.input}`}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={`divide-y ${styles.border}`}>
              {apps.length === 0 ? (
                <div className={`text-center py-10 text-xs ${styles.subtext}`}>
                  No applications received yet. Spread word about your job openings!
                </div>
              ) : filteredApps.length === 0 ? (
                <div className={`text-center py-10 text-xs ${styles.subtext} flex flex-col items-center gap-2`}>
                  <AlertCircle className="h-6 w-6 text-slate-450 dark:text-slate-500" />
                  <p className="font-semibold">No Results Found</p>
                  <p className="text-[10px] opacity-70">No candidate applications match the active filter criteria.</p>
                  <button
                    onClick={() => {
                      setFilterSearch("");
                      setFilterJob("All");
                      setFilterStatus("All");
                    }}
                    className={`mt-2 px-3 py-1 rounded-lg border text-2xs font-bold transition cursor-pointer hover:bg-slate-500/5 ${styles.buttonSecondary}`}
                    type="button"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredApps.map(app => (
                  <div key={app.id} className="py-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-bold text-sm ${styles.heading}`}>
                          {app.candidateName}
                        </h3>
                        <p className={`text-xs mt-1 ${styles.subtext}`}>
                          Applied for: <span className={`font-semibold ${styles.text}`}>{app.jobTitle}</span> &bull; <span className="font-mono text-3xs">{formatDateTime(app.appliedOn)}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block rounded px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider border ${
                          app.status === "Interview Scheduled"
                            ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900"
                            : app.status === "Accepted"
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                            : app.status === "Rejected"
                            ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900"
                            : "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900"
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>

                    {/* Applicant cover summary detail */}
                    <div className={`rounded-2xl p-4 text-xs space-y-2 border ${styles.panel} bg-slate-50/5`}>
                      {app.experience && (
                        <p><strong className={styles.heading}>Professional background:</strong> {app.experience}</p>
                      )}
                      {app.coverLetter && (
                        <p className={`italic ${styles.text}`}>"{app.coverLetter}"</p>
                      )}
                      <p className={`text-3xs ${styles.subtext}`}>Applicant email details: <code>{app.candidateEmail}</code></p>
                    </div>

                    {/* Interview Feedback Scorecard */}
                    {(() => {
                      const matchingInterview = ints.find(i => i.applicationId === app.id && i.status === "Completed");
                      if (!matchingInterview || !matchingInterview.evaluation) return null;
                      return (
                        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-4 text-xs animate-fade-in space-y-3 mt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-dashed border-emerald-500/10 pb-2">
                            <span className="text-3xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1">
                              <Check className="h-3 w-3 text-emerald-500 animate-pulse" /> Interview Panel Scorecard Submitted
                            </span>
                            <span className="text-4xs text-slate-450 font-mono">
                              Evaluator: <strong>{matchingInterview.interviewerName}</strong>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-slate-500/5 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                              <span className="block text-[8px] font-bold text-slate-400 uppercase">TECH SKILLS</span>
                              <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 font-mono">
                                {matchingInterview.evaluation.technicalScore}/10
                              </span>
                            </div>
                            <div className="bg-slate-500/5 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                              <span className="block text-[8px] font-bold text-slate-400 uppercase">COMMUNICATION</span>
                              <span className="text-xs font-bold text-purple-650 dark:text-purple-400 font-mono">
                                {matchingInterview.evaluation.softSkillsScore || 8}/10
                              </span>
                            </div>
                            <div className="bg-slate-500/5 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                              <span className="block text-[8px] font-bold text-slate-400 uppercase">CULTURAL FIT</span>
                              <span className="text-xs font-bold text-emerald-650 dark:text-emerald-400 font-mono">
                                {matchingInterview.evaluation.cultureFitScore}/10
                              </span>
                            </div>
                          </div>

                          {matchingInterview.evaluation.notes && (
                            <div className="border-t border-dashed border-slate-200/50 dark:border-slate-800/50 pt-2 text-[11px]">
                              <span className="block text-4xs font-bold text-slate-450 mb-0.5 uppercase">Panelist Evaluation Summary Notes</span>
                              <p className={`italic ${styles.text}`}>
                                "{matchingInterview.evaluation.notes}"
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Stage Actions */}
                    <div className="flex flex-wrap gap-2 justify-end pt-1">
                      {app.status === "Applied" && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, "Reviewed")}
                          className={`rounded-lg px-3 py-1.5 text-3xs font-semibold cursor-pointer transition border ${styles.buttonSecondary}`}
                        >
                          Mark as Reviewed
                        </button>
                      )}

                      {app.status !== "Interview Scheduled" && app.status !== "Accepted" && app.status !== "Rejected" && (
                        <button
                          onClick={() => setActiveAppToSchedule(app)}
                          className="rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 px-3 py-1.5 text-3xs font-bold text-white shadow-xs cursor-pointer transition"
                        >
                          Schedule Interview
                        </button>
                      )}

                      {app.status !== "Accepted" && app.status !== "Rejected" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.id, "Accepted")}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 px-3 py-1.5 text-3xs font-bold text-white shadow-xs cursor-pointer transition"
                          >
                            <Check className="h-3 w-3" /> Accept Candidate
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, "Rejected")}
                            className="flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-3 py-1.5 text-3xs font-semibold cursor-pointer transition"
                          >
                            <X className="h-3 w-3" /> Decline Candidate
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Calendar */}
      {activeTab === "calendar" && (
        <div className={`rounded-3xl border p-6 transition-colors duration-200 ${styles.panel}`}>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase font-mono mb-1">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            Active Recruiting Calendar
          </div>
          <h2 className={`text-xl font-bold font-sans tracking-tight mb-2 ${styles.heading}`}>
            Interview Schedules, Delays, & Declines
          </h2>
          <p className={`text-xs ${styles.subtext} mb-6`}>
            Select any date on the monthly calendar grid to view panels scheduled, record delays/reschedules, or track candidate declines.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Month Grid */}
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
                  {/* Legend Indicator */}
                  <div className="hidden sm:flex items-center gap-3 text-[10px] font-semibold mr-2">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Scheduled</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Delayed</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Declines</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed</span>
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
                        setEditingInterviewId(null);
                      }}
                      type="button"
                      className={`min-h-[64px] p-1.5 rounded-xl border flex flex-col justify-between text-left transition cursor-pointer relative focus:outline-none ${
                        isSelected
                          ? "bg-indigo-500/5 border-indigo-500 ring-1 ring-indigo-500/50"
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
                          let dotColor = "bg-indigo-500";
                          if (intv.status === "Delayed") dotColor = "bg-amber-500";
                          if (intv.status === "Cancelled") dotColor = "bg-red-500";
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

            {/* Day Details Panel */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${styles.border} bg-slate-500/[0.02]`}>
              <div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase mb-3">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" />
                  Schedule Details
                </div>
                
                <h4 className={`text-xs font-extrabold font-sans mb-1 ${styles.heading}`}>
                  {formatReadableDate(selectedCalDateStr)}
                </h4>
                <p className={`text-[10px] ${styles.subtext} mb-4`}>
                  Manage status updates and reschedules for selected day panels.
                </p>

                {/* Interviews List */}
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {selectedDayInterviews.length === 0 ? (
                    <div className={`text-center py-10 ${styles.subtext} border border-dashed rounded-xl p-4 bg-slate-500/[0.01]`}>
                      <CalendarDays className="h-7 w-7 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-2xs font-semibold">No Panels Scheduled</p>
                      <p className="text-[10px] mt-1 opacity-70">Schedules, delays, and declines appear here.</p>
                    </div>
                  ) : (
                    selectedDayInterviews.map(intv => {
                      const isEditing = editingInterviewId === intv.id;
                      const timeOnly = intv.dateTime ? intv.dateTime.substring(11, 16) : "00:00";
                      
                      return (
                        <div key={intv.id} className={`p-3 rounded-xl border text-2xs ${styles.border} bg-white dark:bg-slate-900/30 shadow-2xs`}>
                          <div className="flex justify-between items-start gap-1">
                            <div className="max-w-[70%]">
                              <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">{intv.candidateName}</span>
                              <span className={`block text-[10px] opacity-80 truncate ${styles.subtext}`}>{intv.jobTitle}</span>
                            </div>
                            
                            <span className={`rounded-md px-1.5 py-0.5 text-[8px] font-extrabold uppercase border shrink-0 ${
                              intv.status === "Scheduled"
                                ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30"
                                : intv.status === "Delayed"
                                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30"
                                : intv.status === "Cancelled"
                                ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/30"
                                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30"
                            }`}>
                              {intv.status}
                            </span>
                          </div>

                          <div className="mt-2 text-[10px] space-y-1 text-slate-500 dark:text-slate-400 border-t border-dashed border-slate-200/65 dark:border-slate-800/65 pt-1.5">
                            <p><strong>Panelist:</strong> {intv.interviewerName}</p>
                            <p className="flex items-center gap-1">
                              <Clock className="h-3 w-3 inline text-slate-400" />
                              <strong>Slot Time:</strong> <span className="font-mono bg-slate-500/5 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-bold">{timeOnly}</span>
                            </p>
                          </div>

                          {/* Edit Reschedule form inline */}
                          {isEditing ? (
                            <div className="mt-3 p-2 bg-slate-500/5 rounded-xl border border-indigo-500/20 space-y-2">
                              <label className="block text-[9px] font-bold uppercase text-slate-450">New Slot Datetime:</label>
                              <input
                                type="datetime-local"
                                value={rescheduleDateTime}
                                onChange={(e) => setRescheduleDateTime(e.target.value)}
                                className={`w-full text-3xs p-1.5 rounded-lg border focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 ${styles.input}`}
                              />
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => setEditingInterviewId(null)}
                                  className="px-2 py-1 rounded text-[9px] font-bold text-slate-500 hover:bg-slate-500/10 transition cursor-pointer"
                                  type="button"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleUpdateInterview(intv.id, "Delayed", rescheduleDateTime)}
                                  className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] transition cursor-pointer shadow-xs"
                                  type="button"
                                >
                                  Save Reschedule (Delay)
                                </button>
                              </div>
                            </div>
                          ) : (
                            intv.status !== "Completed" && intv.status !== "Cancelled" && (
                              <div className="mt-3 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800/50 pt-2">
                                <button
                                  onClick={() => {
                                    setEditingInterviewId(intv.id);
                                    setRescheduleDateTime(intv.dateTime || "");
                                  }}
                                  className={`px-2 py-1 text-[9px] font-bold rounded-lg transition border cursor-pointer ${styles.buttonSecondary}`}
                                  type="button"
                                >
                                  Reschedule / Delay
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Decline or Cancel this interview panel slot?")) {
                                      handleUpdateInterview(intv.id, "Cancelled");
                                    }
                                  }}
                                  className="px-2 py-1 text-[9px] font-bold rounded-lg transition bg-red-500/5 hover:bg-red-500/15 text-red-600 border border-red-500/15 cursor-pointer"
                                  type="button"
                                >
                                  Cancel / Decline
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-400 flex items-center gap-1.5 justify-center leading-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Direct Sync Panel Active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Publish a Job */}
      {activeTab === "publish" && (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className={`lg:col-span-2 rounded-3xl border p-6 transition-colors duration-200 shadow-xs ${styles.panel}`}>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase font-mono mb-1">
              <PlusCircle className="h-4 w-4" />
              Recruitment Publishing
            </div>
            <h2 className={`text-xl font-bold font-sans tracking-tight mb-2 ${styles.heading}`}>
              Publish a New Job Opening
            </h2>
            <p className={`text-xs ${styles.subtext} mb-6`}>
              Post brand new role requirements and salary specifications to start receiving inbound candidates instantly.
            </p>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-450 dark:text-slate-500">Role Title / Designation *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Lead Talent Coordinator"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 ${styles.input}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-450 dark:text-slate-500">Salary Budget *</label>
                  <input
                    type="text"
                    required
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="e.g. $100K - $120K"
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 ${styles.input}`}
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-450 dark:text-slate-500">Workplace Location</label>
                  <input
                    type="text"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    placeholder="e.g. Chicago / Remote"
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 ${styles.input}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-450 dark:text-slate-500">Technology Keywords (comma separated)</label>
                <input
                  type="text"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  placeholder="e.g. SQL, Spring Boot, Java"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 ${styles.input}`}
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-450 dark:text-slate-500">Role Requirements & description *</label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide core operations overview..."
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 ${styles.input}`}
                />
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 font-bold text-white py-3 disabled:opacity-50 transition cursor-pointer shadow-md"
              >
                <PlusCircle className="h-4 w-4" /> Publish Job Opening
              </button>
            </form>
          </div>

          {/* Side List of Open Roles */}
          <div className="space-y-6">
            <div className={`rounded-3xl border p-5 ${styles.panel} bg-slate-500/[0.01]`}>
              <h3 className={`text-xs font-extrabold uppercase tracking-wider mb-4 text-slate-500 flex items-center gap-1.5 ${styles.subtext}`}>
                <ClipboardList className="h-4 w-4 text-indigo-500" />
                Active Roles Listed ({jobs.length})
              </h3>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {jobs.map(j => (
                  <div key={j.id} className={`p-3.5 rounded-xl border text-xs leading-relaxed ${styles.border} bg-white dark:bg-slate-900/50 shadow-2xs`}>
                    <span className={`font-bold block ${styles.heading}`}>{j.title}</span>
                    <p className={`text-3xs mt-1 leading-normal opacity-90 ${styles.subtext}`}>
                      {j.description.length > 90 ? j.description.substring(0, 85) + "..." : j.description}
                    </p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="font-semibold">{j.location || "Remote"}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{j.salary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Visual Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Custom Reports & Export Panel */}
          <div className={`rounded-3xl border p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${styles.panel} border-indigo-500/15 bg-indigo-500/[0.01]`}>
            <div>
              <h3 className={`text-xs font-bold font-sans uppercase tracking-wider flex items-center gap-2 ${styles.heading}`}>
                <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
                Custom Recruitment Funnel Reports
              </h3>
              <p className={`text-[11px] leading-relaxed mt-1 ${styles.subtext}`}>
                Analyze and export real-time pipelines, evaluations, scorecards, and candidate notes to formatted CSV spreadsheets.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition shadow-xs shrink-0 bg-indigo-600 text-white hover:bg-indigo-700 font-sans"
            >
              <Download className="h-4 w-4" />
              Export Pipeline CSV
            </button>
          </div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Selection Rate</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-emerald-600 dark:text-emerald-400`}>
                {apps.length > 0 ? ((apps.filter(a => a.status === "Accepted").length / apps.length) * 100).toFixed(0) : 0}%
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Accepted out of total applied</p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Screening conversion</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-indigo-600 dark:text-indigo-400`}>
                {apps.length > 0 ? ((apps.filter(a => a.status !== "Applied").length / apps.length) * 100).toFixed(0) : 0}%
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Reviewed or interviewed</p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Interview Completion</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-purple-600 dark:text-purple-400`}>
                {ints.length > 0 ? ((ints.filter(i => i.status === "Completed").length / ints.length) * 100).toFixed(0) : 0}%
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Evaluated panels out of scheduled</p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Delay & Reschedule rate</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-amber-600 dark:text-amber-400`}>
                {ints.length > 0 ? ((ints.filter(i => i.status === "Delayed").length / ints.length) * 100).toFixed(0) : 0}%
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Interviews marked as delayed</p>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Chart 1: Applications by Job Title */}
            <div className={`rounded-3xl border p-5 ${styles.panel}`}>
              <div className="mb-3">
                <h4 className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.subtext}`}>Applications by Job Openings</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Distribution of candidate applications across active role openings.</p>
              </div>
              <div className="h-64">
                {allJobTitles.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-xs text-slate-400">
                    No roles published to chart.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={allJobTitles.map(t => ({
                      role: t.length > 18 ? t.substring(0, 16) + "..." : t,
                      Candidates: apps.filter(a => a.jobTitle === t).length
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="role" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                      <Bar dataKey="Candidates" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Applications Pipeline Funnel Breakdown */}
            <div className={`rounded-3xl border p-5 ${styles.panel}`}>
              <div className="mb-3">
                <h4 className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.subtext}`}>Pipeline Funnel Status</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Total count of applications currently sitting in each step of the pipeline.</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { stage: "Applied", Count: apps.filter(a => a.status === "Applied").length, fill: "#3b82f6" },
                      { stage: "Reviewed", Count: apps.filter(a => a.status === "Reviewed").length, fill: "#0ea5e9" },
                      { stage: "Scheduled", Count: apps.filter(a => a.status === "Interview Scheduled").length, fill: "#a855f7" },
                      { stage: "Accepted", Count: apps.filter(a => a.status === "Accepted").length, fill: "#10b981" },
                      { stage: "Rejected", Count: apps.filter(a => a.status === "Rejected").length, fill: "#ef4444" },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} allowDecimals={false} />
                    <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={9} width={90} />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                    <Bar dataKey="Count" radius={[0, 4, 4, 0]} barSize={18}>
                      {[
                        { stage: "Applied", Count: apps.filter(a => a.status === "Applied").length, fill: "#3b82f6" },
                        { stage: "Reviewed", Count: apps.filter(a => a.status === "Reviewed").length, fill: "#0ea5e9" },
                        { stage: "Scheduled", Count: apps.filter(a => a.status === "Interview Scheduled").length, fill: "#a855f7" },
                        { stage: "Accepted", Count: apps.filter(a => a.status === "Accepted").length, fill: "#10b981" },
                        { stage: "Rejected", Count: apps.filter(a => a.status === "Rejected").length, fill: "#ef4444" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Interview Slot Status Breakdown */}
            <div className={`rounded-3xl border p-5 ${styles.panel}`}>
              <div className="mb-3">
                <h4 className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.subtext}`}>Interview Status Distribution</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Scheduled slots breakdown reflecting delays, completions and declines.</p>
              </div>
              <div className="h-64 flex flex-col sm:flex-row items-center justify-around">
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Scheduled", value: ints.filter(i => i.status === "Scheduled").length, fill: "#6366f1" },
                          { name: "Completed", value: ints.filter(i => i.status === "Completed").length, fill: "#10b981" },
                          { name: "Delayed", value: ints.filter(i => i.status === "Delayed").length, fill: "#f59e0b" },
                          { name: "Cancelled/Declined", value: ints.filter(i => i.status === "Cancelled").length, fill: "#ef4444" },
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {[
                          { name: "Scheduled", value: ints.filter(i => i.status === "Scheduled").length, fill: "#6366f1" },
                          { name: "Completed", value: ints.filter(i => i.status === "Completed").length, fill: "#10b981" },
                          { name: "Delayed", value: ints.filter(i => i.status === "Delayed").length, fill: "#f59e0b" },
                          { name: "Cancelled/Declined", value: ints.filter(i => i.status === "Cancelled").length, fill: "#ef4444" },
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-[10px] font-mono shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-indigo-500 block" />
                    <span>Scheduled ({ints.filter(i => i.status === "Scheduled").length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 block" />
                    <span>Completed ({ints.filter(i => i.status === "Completed").length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500 block" />
                    <span>Delayed ({ints.filter(i => i.status === "Delayed").length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500 block" />
                    <span>Declined ({ints.filter(i => i.status === "Cancelled").length})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 4: Candidate Competency Score Comparison */}
            <div className={`rounded-3xl border p-5 ${styles.panel}`}>
              <div className="mb-3">
                <h4 className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.subtext}`}>Interviewer Evaluated Scores</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Technical vs. Soft Skills competencies for evaluated candidate panels (out of 5.0).</p>
              </div>
              <div className="h-64">
                {ints.filter(i => i.status === "Completed" && i.evaluation).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[10px] text-slate-400 border border-dashed rounded-xl p-4 bg-slate-500/[0.01]">
                    <ClipboardList className="h-6 w-6 text-slate-400 mb-2" />
                    No Evaluations Registered Yet
                    <p className="text-[9px] mt-1 opacity-75">Completed panels with ratings appear here.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ints
                        .filter(i => i.status === "Completed" && i.evaluation)
                        .map(i => ({
                          name: i.candidateName.split(" ")[0],
                          Technical: i.evaluation?.technicalScore || 0,
                          "Soft Skills": i.evaluation?.softSkillsScore || 0,
                        }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} domain={[0, 5]} allowDecimals={true} />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                      <Bar dataKey="Technical" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={12} />
                      <Bar dataKey="Soft Skills" fill="#a855f7" radius={[2, 2, 0, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduler Dialog Overlay */}
      {activeAppToSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${styles.panel}`}>
            <div className={`flex items-center justify-between border-b pb-3 mb-4 ${styles.border}`}>
              <h3 className={`font-bold text-sm ${styles.heading}`}>Schedule Recruitment Panel</h3>
              <button
                onClick={() => setActiveAppToSchedule(null)}
                className={`text-xs font-semibold cursor-pointer transition ${styles.subtext} hover:opacity-80`}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${styles.subtext}`}>Candidate Name</label>
                <input
                  type="text"
                  disabled
                  value={activeAppToSchedule.candidateName}
                  className={`w-full rounded-xl border px-3 py-2 font-medium opacity-70 ${styles.input}`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${styles.subtext}`}>Position</label>
                <input
                  type="text"
                  disabled
                  value={activeAppToSchedule.jobTitle}
                  className={`w-full rounded-xl border px-3 py-2 font-medium opacity-70 ${styles.input}`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${styles.subtext}`}>Assign Expert Interviewer Panelist *</label>
                <select
                  required
                  value={selectedInterviewerId}
                  onChange={(e) => setSelectedInterviewerId(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:border-indigo-500 ${styles.input}`}
                >
                  <option value="" className="bg-slate-900 text-white">-- Choose Panelist --</option>
                  {interviewers.map(intv => (
                    <option key={intv.id} value={intv.id} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-white">
                      {intv.firstName} {intv.lastName} ({intv.userEmail})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${styles.subtext}`}>Slot Date and Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={dateTimeStr}
                  onChange={(e) => setDateTimeStr(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:border-indigo-500 ${styles.input}`}
                />
              </div>

              <button
                type="submit"
                disabled={isScheduling}
                className="flex w-full items-center justify-center gap-1 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 py-3 rounded-xl font-bold text-white disabled:opacity-50 shadow-md cursor-pointer transition"
              >
                Schedule Panel Interview
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
