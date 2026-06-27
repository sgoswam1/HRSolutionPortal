import React, { useState, useEffect } from "react";
import { User, Interview } from "../types";
import {
  UserCheck,
  Star,
  FileText,
  CheckCircle,
  Clock,
  BookOpen,
  PenTool,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ClipboardList,
  Calendar as CalendarIcon,
  TrendingUp,
  Award,
  Zap
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
  Legend,
  LineChart,
  Line,
  Cell
} from "recharts";

interface InterviewerDashboardProps {
  currentUser: User;
}

export default function InterviewerDashboard({ currentUser }: InterviewerDashboardProps) {
  const { styles, formatDateTime } = usePreferences();
  const [ints, setInts] = useState<Interview[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"assignments" | "calendar" | "analytics">("assignments");
  const [selectedIntToEvaluate, setSelectedIntToEvaluate] = useState<Interview | null>(null);

  // Scorecard values
  const [techScore, setTechScore] = useState<number>(8);
  const [softScore, setSoftScore] = useState<number>(8);
  const [cultureScore, setCultureScore] = useState<number>(8);
  const [evalNotes, setEvalNotes] = useState<string>("");
  const [submittingEval, setSubmittingEval] = useState<boolean>(false);

  // Calendar state
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

  const fetchInterviews = async () => {
    try {
      const res = await fetch("/api/interviews");
      if (res.ok) {
        const list: Interview[] = await res.json();
        const myIntv = list.filter(i => i.interviewerId === currentUser.id);
        setInts(myIntv);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const list = await res.json();
        setApps(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInterviews();
    fetchApplications();
  }, [currentUser]);

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntToEvaluate) return;
    setSubmittingEval(true);
    try {
      const res = await fetch("/api/interviews/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: selectedIntToEvaluate.id,
          technicalScore: techScore,
          softSkillsScore: softScore,
          cultureFitScore: cultureScore,
          notes: evalNotes
        })
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: "Evaluation feedback submitted. Candidate score updated!", type: "success" }
        }));
        setSelectedIntToEvaluate(null);
        setTechScore(8);
        setSoftScore(8);
        setCultureScore(8);
        setEvalNotes("");
        fetchInterviews();
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message: "Error saving evaluation feedback.", type: "error" }
      }));
    } finally {
      setSubmittingEval(false);
    }
  };

  const pendingSchedules = ints.filter(i => i.status === "Scheduled");
  const completedAssessments = ints.filter(i => i.status === "Completed");

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

  // Metrics calculations
  const totalAssignedCount = ints.length;
  const pendingCount = pendingSchedules.length;
  const completedCount = completedAssessments.length;
  const rescheduleCount = ints.filter(i => i.status === "Delayed").length;

  const avgTechnical = completedAssessments.length > 0
    ? Number((completedAssessments.reduce((acc, curr) => acc + (curr.evaluation?.technicalScore || 0), 0) / completedAssessments.length).toFixed(1))
    : 0;

  const avgSoft = completedAssessments.length > 0
    ? Number((completedAssessments.reduce((acc, curr) => acc + (curr.evaluation?.softSkillsScore || 0), 0) / completedAssessments.length).toFixed(1))
    : 0;

  const avgCulture = completedAssessments.length > 0
    ? Number((completedAssessments.reduce((acc, curr) => acc + (curr.evaluation?.cultureFitScore || 0), 0) / completedAssessments.length).toFixed(1))
    : 0;

  // Visual Analytics Charts Data
  const ratingDetailsData = completedAssessments.map(item => ({
    name: item.candidateName.length > 12 ? item.candidateName.substring(0, 10) + "..." : item.candidateName,
    Technical: item.evaluation?.technicalScore || 0,
    "Soft Skills": item.evaluation?.softSkillsScore || 0,
    "Culture Fit": item.evaluation?.cultureFitScore || 0
  }));

  const statusDistributionData = [
    { name: "Scheduled", count: pendingCount, fill: "#8b5cf6" },
    { name: "Rescheduled / Delayed", count: rescheduleCount, fill: "#f59e0b" },
    { name: "Completed Panels", count: completedCount, fill: "#10b981" },
    { name: "Declined", count: ints.filter(i => i.status === "Cancelled").length, fill: "#ef4444" }
  ];

  return (
    <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-200 ${styles.text}`}>
      {/* Header Panel */}
      <div className={`mb-8 rounded-3xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200 ${styles.panel}`}>
        <div>
          <span className="text-xs font-semibold text-purple-600 font-mono uppercase tracking-wider">Interviewer panels panel</span>
          <h1 className={`text-2xl font-bold font-sans tracking-tight mt-0.5 ${styles.heading}`}>
            Interviewer Panel Suite
          </h1>
          <p className={`text-sm mt-1 ${styles.subtext}`}>
            Conduct virtual reviews, examine candidate profiles, and submit numerical scorecards.
          </p>
        </div>

        <div className={`flex gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 text-2xs font-mono ${styles.border}`}>
          <div>
            <span className={`block font-sans font-semibold ${styles.subtext}`}>INTERVIEWER ID</span>
            <span className={styles.text}>INTVR-00{currentUser.id}</span>
          </div>
          <div>
            <span className={`block font-sans font-semibold ${styles.subtext}`}>NAME REFERENCE</span>
            <span className={styles.text}>{currentUser.firstName} {currentUser.lastName}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 mb-8 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "assignments"
              ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          id="tab-interviewer-assignments"
          type="button"
        >
          <ClipboardList className="h-4 w-4" />
          My Assignments ({ints.length})
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "calendar"
              ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          id="tab-interviewer-calendar"
          type="button"
        >
          <CalendarIcon className="h-4 w-4" />
          My Calendar
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "analytics"
              ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 font-extrabold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
          id="tab-interviewer-analytics"
          type="button"
        >
          <BarChart3 className="h-4 w-4" />
          Performance & Metrics
        </button>
      </div>

      {/* Tab: My Assignments */}
      {activeTab === "assignments" && (
        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Columns - Pending assignments list */}
          <div className="md:col-span-2 space-y-6">
            <div className={`rounded-3xl border p-6 transition-colors duration-200 ${styles.panel}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-bold font-sans ${styles.heading}`}>Assigned Interview Schedules</h2>
                <span className="text-3xs font-semibold px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-450 rounded-lg font-mono">
                  {pendingSchedules.length} PENDING
                </span>
              </div>
              
              {pendingSchedules.length === 0 ? (
                <div className={`text-center py-12 text-slate-400 border rounded-2xl bg-slate-50/50 ${styles.border}`}>
                  <Clock className="h-8 w-8 mx-auto text-slate-350 mb-2" />
                  <p className={`text-xs font-medium ${styles.heading}`}>All clear! No pending interview schedules.</p>
                  <p className={`text-3xs mt-1 ${styles.subtext}`}>HR recruiters will assign slots as candidates apply.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSchedules.map(int => (
                    <div key={int.id} className={`rounded-2xl border p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${styles.panel} bg-slate-50/10`}>
                      <div>
                        <span className={`text-3xs font-mono ${styles.subtext}`}>SESSION ID: #{int.id} &bull; {formatDateTime(int.dateTime)}</span>
                        <h3 className={`font-bold text-sm mt-1 ${styles.heading}`}>{int.candidateName}</h3>
                        <p className={`text-xs mt-0.5 ${styles.subtext}`}>{int.jobTitle}</p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedIntToEvaluate(int);
                          setTechScore(8);
                          setSoftScore(8);
                          setCultureScore(8);
                          setEvalNotes("");
                        }}
                        className="rounded-xl bg-purple-600 dark:bg-purple-500 hover:bg-purple-500 dark:hover:bg-purple-400 px-4 py-2 text-2xs font-bold text-white cursor-pointer transition shadow-xs shrink-0"
                        id={`btn-evaluate-${int.id}`}
                      >
                        Evaluate Candidate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Previous Assessments History */}
            <div className={`rounded-3xl border p-6 transition-colors duration-200 ${styles.panel}`}>
              <h2 className={`text-lg font-bold font-sans mb-4 ${styles.heading}`}>Completed Feedback History</h2>

              {completedAssessments.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No previous assessments on file.
                </div>
              ) : (
                <div className="space-y-4">
                  {completedAssessments.map(int => (
                    <div key={int.id} className={`rounded-2xl border p-5 bg-slate-50/5 ${styles.border}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-bold text-xs ${styles.heading}`}>{int.candidateName}</h4>
                          <p className={`text-3xs ${styles.subtext}`}>{int.jobTitle}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 text-4xs font-bold text-emerald-700 dark:text-emerald-300 uppercase border border-emerald-200 dark:border-emerald-900">
                          <CheckCircle className="h-3 w-3" /> Submitted
                        </span>
                      </div>

                      {int.evaluation && (
                        <div className={`mt-4 border-t pt-2 grid gap-4 grid-cols-3 text-center bg-slate-50/10 p-3 rounded-xl border animate-fade-in ${styles.border}`}>
                          <div>
                            <span className="block text-4xs font-bold text-slate-400 uppercase">TECH FIT</span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">{int.evaluation.technicalScore}/10</span>
                          </div>
                          <div>
                            <span className="block text-4xs font-bold text-slate-400 uppercase">SOFT VALUE</span>
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">{int.evaluation.softSkillsScore}/10</span>
                          </div>
                          <div>
                            <span className="block text-4xs font-bold text-slate-400 uppercase">CULTURAL FIT</span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{int.evaluation.cultureFitScore}/10</span>
                          </div>
                          <div className={`col-span-3 text-left border-t pt-2 ${styles.border}`}>
                            <span className="block text-4xs font-bold text-slate-400 mb-0.5 uppercase">EVALUATION NOTES SUMMARY</span>
                            <p className={`text-3xs italic ${styles.text}`}>"{int.evaluation.notes}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Checklist */}
          <div className="space-y-6">
            <div className={`rounded-3xl border p-6 shadow-xs h-fit space-y-4 ${styles.panel}`}>
              <h2 className={`text-sm font-bold font-sans uppercase tracking-wider ${styles.subtext}`}>Conduct Guidelines</h2>
              
              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <span className="text-purple-600 dark:text-purple-400 font-bold font-mono">01.</span>
                  <p className={styles.text}>Audit core resume keywords before checking candidate credentials.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-600 dark:text-purple-400 font-bold font-mono">02.</span>
                  <p className={styles.text}>Be objective on points values (Technical skills, communicative ability, alignment value).</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-600 dark:text-purple-400 font-bold font-mono">03.</span>
                  <p className={styles.text}>Summarize structural observations into written feedback reports.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: My Calendar */}
      {activeTab === "calendar" && (
        <div className={`rounded-3xl border p-6 transition-colors duration-200 ${styles.panel}`}>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase font-mono mb-1">
            <CalendarIcon className="h-4 w-4 text-purple-500" />
            Interviewer Personal Calendar
          </div>
          <h2 className={`text-xl font-bold font-sans tracking-tight mb-2 ${styles.heading}`}>
            Assigned Interview Calendars & Schedules
          </h2>
          <p className={`text-xs ${styles.subtext} mb-6`}>
            Select any date on the monthly calendar grid to view your assigned panels, candidates, and evaluate them directly.
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
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> My Interview</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed</span>
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
                          ? "bg-purple-500/5 border-purple-500 ring-1 ring-purple-500/50"
                          : isToday
                          ? "bg-purple-500/5 border-purple-400 text-purple-600 dark:text-purple-400"
                          : cell.isCurrentMonth
                          ? "border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-500/5 text-slate-800 dark:text-slate-200"
                          : "border-slate-100 dark:border-slate-900 bg-slate-500/[0.01] hover:bg-slate-500/5 text-slate-400 dark:text-slate-600 opacity-60"
                      }`}
                    >
                      <span className={`text-2xs font-bold leading-none ${isToday ? "font-extrabold text-purple-600 dark:text-purple-400" : ""}`}>
                        {cell.dayNumber}
                      </span>

                      {/* Dots / Indicators */}
                      <div className="flex flex-wrap gap-1 mt-1.5 justify-start w-full">
                        {dayInterviews.slice(0, 3).map(intv => {
                          let dotColor = "bg-purple-500";
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

            {/* Day Details Panel */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${styles.border} bg-slate-500/[0.02]`}>
              <div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase mb-3">
                  <Clock className="h-3.5 w-3.5 text-purple-500" />
                  Assigned Panels Info
                </div>
                
                <h4 className={`text-xs font-extrabold font-sans mb-1 ${styles.heading}`}>
                  {formatReadableDate(selectedCalDateStr)}
                </h4>
                <p className={`text-[10px] ${styles.subtext} mb-4`}>
                  Manage evaluation processes for selected day assigned panels.
                </p>

                {/* Interviews List */}
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {selectedDayInterviews.length === 0 ? (
                    <div className={`text-center py-10 ${styles.subtext} border border-dashed rounded-xl p-4 bg-slate-500/[0.01]`}>
                      <CalendarIcon className="h-7 w-7 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-2xs font-semibold">No Panels Scheduled</p>
                      <p className="text-[10px] mt-1 opacity-70">Assigned interviews for this day will appear here.</p>
                    </div>
                  ) : (
                    selectedDayInterviews.map(intv => {
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
                                ? "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30"
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
                            <p className="flex items-center gap-1">
                              <Clock className="h-3 w-3 inline text-slate-400" />
                              <strong>Slot Time:</strong> <span className="font-mono bg-slate-500/5 px-1 py-0.5 rounded text-purple-600 dark:text-purple-400 font-bold">{timeOnly}</span>
                            </p>
                          </div>

                          {intv.status === "Scheduled" && (
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => {
                                  setSelectedIntToEvaluate(intv);
                                  setActiveTab("assignments");
                                }}
                                className="px-2.5 py-1 text-[9px] font-bold rounded-lg transition bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                                type="button"
                              >
                                Evaluate Now
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-400 flex items-center gap-1.5 justify-center leading-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                Interviewer Calendar Connected
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Analytics & Metrics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-fade-in">
            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Total Assigned</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-purple-600 dark:text-purple-400`}>
                {totalAssignedCount}
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Interviews in schedule roster</p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Completed Evaluations</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-emerald-600 dark:text-emerald-400`}>
                {completedCount}
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Feedback reports submitted</p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Pending Reviews</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-amber-600 dark:text-amber-400`}>
                {pendingCount}
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Schedules left to evaluate</p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${styles.subtext}`}>Avg Technical Rating</span>
              <span className={`block text-xl font-bold mt-1 font-mono text-indigo-600 dark:text-indigo-400`}>
                {avgTechnical > 0 ? avgTechnical : "N/A"}/10
              </span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Average candidate score given</p>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Chart 1: Candidate Scores Comparison */}
            <div className={`rounded-3xl border p-5 ${styles.panel}`}>
              <div className="mb-3">
                <h4 className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.subtext}`}>Evaluation Scores Profile</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Numerical scores given across Technical, Soft Skills, and Culture Fit criteria.</p>
              </div>
              <div className="h-64">
                {ratingDetailsData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-xs text-slate-400">
                    No evaluations completed to visualize.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingDetailsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} domain={[0, 10]} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                      <Bar dataKey="Technical" fill="#6366f1" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Soft Skills" fill="#a855f7" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Culture Fit" fill="#10b981" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Status Distribution of Assignments */}
            <div className={`rounded-3xl border p-5 ${styles.panel}`}>
              <div className="mb-3">
                <h4 className={`text-xs font-bold font-sans uppercase tracking-wider ${styles.subtext}`}>Roster Status Distribution</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Summary count of all interview sessions assigned to you by current workflow status.</p>
              </div>
              <div className="h-64">
                {ints.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-xs text-slate-400">
                    No assigned interviews to chart.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusDistributionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={9} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={120} />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Quick Average Breakdown Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel} bg-slate-500/[0.01]`}>
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase mb-2">
                <Star className="h-4 w-4" />
                Technical Competency Avg
              </div>
              <span className={`block text-2xl font-bold font-mono ${styles.heading}`}>{avgTechnical > 0 ? avgTechnical : "N/A"}<span className="text-xs text-slate-400">/10</span></span>
              <p className="text-3xs text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                Reflects standard coding tests, systems design performance, and analytical problem-solving.
              </p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel} bg-slate-500/[0.01]`}>
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-[10px] uppercase mb-2">
                <BookOpen className="h-4 w-4" />
                Communicative Skills Avg
              </div>
              <span className={`block text-2xl font-bold font-mono ${styles.heading}`}>{avgSoft > 0 ? avgSoft : "N/A"}<span className="text-xs text-slate-400">/10</span></span>
              <p className="text-3xs text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                Measures articulate collaboration, explaining complexity, active listening, and soft skills fit.
              </p>
            </div>

            <div className={`rounded-2xl border p-4 transition-colors duration-200 ${styles.panel} bg-slate-500/[0.01]`}>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase mb-2">
                <UserCheck className="h-4 w-4" />
                Cultural Fit Avg
              </div>
              <span className={`block text-2xl font-bold font-mono ${styles.heading}`}>{avgCulture > 0 ? avgCulture : "N/A"}<span className="text-xs text-slate-400">/10</span></span>
              <p className="text-3xs text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                Indicates synergy, leadership capability, company alignment, and emotional maturity points.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Scorecard Side Sheet / Dialog */}
      {selectedIntToEvaluate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl ${styles.panel} max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between border-b pb-3 mb-4 ${styles.border}`}>
              <div>
                <span className="text-3xs font-extrabold text-purple-600 dark:text-purple-400 uppercase font-mono">Assessment form</span>
                <h3 className={`font-bold text-sm ${styles.heading}`}>Evaluating: {selectedIntToEvaluate.candidateName}</h3>
              </div>
              <button
                onClick={() => setSelectedIntToEvaluate(null)}
                className={`text-xs font-semibold cursor-pointer transition ${styles.subtext} hover:opacity-85`}
              >
                Cancel Review
              </button>
            </div>

            {/* Candidate Qualifications Context Panel */}
            {(() => {
              const matchingApp = apps.find(a => a.id === selectedIntToEvaluate.applicationId);
              if (!matchingApp) return null;
              return (
                <div className={`rounded-2xl border p-4 mb-4 bg-slate-500/5 ${styles.border} text-[11px] leading-relaxed space-y-2`}>
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-3xs font-mono uppercase tracking-wider">
                    <UserCheck className="h-3.5 w-3.5 text-purple-500" />
                    Candidate Profile & Qualifications
                  </div>
                  {matchingApp.experience ? (
                    <p>
                      <strong className={styles.heading}>Professional background:</strong> {matchingApp.experience}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">No professional background overview submitted.</p>
                  )}
                  {matchingApp.coverLetter && (
                    <p className={`italic ${styles.text} bg-slate-500/10 p-2.5 rounded-xl border border-dashed ${styles.border}`}>
                      "{matchingApp.coverLetter}"
                    </p>
                  )}
                  <p className="text-4xs text-slate-450 font-mono mt-1">
                    Direct Contact: <code>{matchingApp.candidateEmail}</code>
                  </p>
                </div>
              );
            })()}

            <form onSubmit={handleSubmitEvaluation} className="space-y-5 text-xs">
              
              {/* Technical skills score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`font-semibold ${styles.subtext}`}>Technical Skill Competence (1-10)</label>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{techScore}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={techScore}
                  onChange={(e) => setTechScore(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Communication / Soft skills */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`font-semibold ${styles.subtext}`}>Communicative & Soft Skills (1-10)</label>
                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">{softScore}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={softScore}
                  onChange={(e) => setSoftScore(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Team alignment / Fit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`font-semibold ${styles.subtext}`}>Cultural Alignment & Fit (1-10)</label>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{cultureScore}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={cultureScore}
                  onChange={(e) => setCultureScore(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Qualitative notes */}
              <div>
                <label className={`block font-semibold mb-1.5 ${styles.heading}`}>Qualitative Evaluation Summary Notes</label>
                <textarea
                  rows={4}
                  required
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Summarize coding competencies, design architecture, or communication flags..."
                  className={`w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:border-purple-500 ${styles.input} bg-white dark:bg-slate-900`}
                />
              </div>

              <div className={`pt-3 border-t ${styles.border}`}>
                <button
                  type="submit"
                  disabled={submittingEval}
                  className="flex w-full items-center justify-center gap-1 bg-purple-600 dark:bg-purple-500 hover:bg-purple-500 dark:hover:bg-purple-400 font-bold text-white py-3 rounded-xl disabled:opacity-50 transition shadow-md cursor-pointer"
                >
                  <PenTool className="h-4 w-4" /> Submit Candidate Evaluation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
