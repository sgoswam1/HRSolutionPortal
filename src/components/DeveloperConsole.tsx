import React, { useState, useEffect } from "react";
import { Terminal, Database, Play, RefreshCw, Layers, CheckCircle, AlertTriangle } from "lucide-react";
import { User, Job, Application, Interview } from "../types";

interface DeveloperConsoleProps {
  onClose: () => void;
}

export default function DeveloperConsole({ onClose }: DeveloperConsoleProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"logs" | "db" | "tester">("logs");
  const [activeDbTable, setActiveDbTable] = useState<"users" | "jobs" | "apps" | "interviews">("users");
  
  // Data State for DB View
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [dbJobs, setDbJobs] = useState<Job[]>([]);
  const [dbApps, setDbApps] = useState<Application[]>([]);
  const [dbInterviews, setDbInterviews] = useState<Interview[]>([]);

  // Tester State
  const [apiMethod, setApiMethod] = useState<string>("GET");
  const [apiPath, setApiPath] = useState<string>("/api/users/getUserTypes/");
  const [apiBody, setApiBody] = useState<string>("{\n  \"userEmail\": \"candidate@demo.com\"\n}");
  const [testerResult, setTesterResult] = useState<string>("");
  const [loadingTester, setLoadingTester] = useState<boolean>(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDbData = async () => {
    try {
      const [rUsers, rJobs, rApps, rInts] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/jobs"),
        fetch("/api/applications"),
        fetch("/api/interviews")
      ]);
      if (rUsers.ok) setDbUsers(await rUsers.json());
      if (rJobs.ok) setDbJobs(await rJobs.json());
      if (rApps.ok) setDbApps(await rApps.json());
      if (rInts.ok) setDbInterviews(await rInts.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchDbData();
    const interval = setInterval(() => {
      fetchLogs();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResetDb = async () => {
    if (confirm("Are you sure you want to reset the HR Portal database sandbox? This will restore initial users and jobs.")) {
      try {
        const res = await fetch("/api/admin/reset", { method: "POST" });
        if (res.ok) {
          fetchLogs();
          fetchDbData();
          alert("Database Sandbox cleared and re-seeded successfully.");
        }
      } catch (e) {
        alert("Error resetting database sandbox.");
      }
    }
  };

  const handleRunTester = async () => {
    setLoadingTester(true);
    setTesterResult("");
    try {
      const options: RequestInit = {
        method: apiMethod,
        headers: { "Content-Type": "application/json" }
      };
      if (apiMethod !== "GET") {
        options.body = apiBody;
      }

      const res = await fetch(apiPath, options);
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const rawText = await res.text();

      if (isJson) {
        const jsonVal = JSON.parse(rawText);
        setTesterResult(JSON.stringify(jsonVal, null, 2));
      } else {
        setTesterResult(rawText);
      }
      fetchLogs();
      fetchDbData();
    } catch (err: any) {
      setTesterResult(`ERROR executing request: ${err.message}`);
    } finally {
      setLoadingTester(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 sm:p-6 lg:p-8">
      <div className="flex h-[80vh] w-full max-w-5xl flex-col rounded-3xl border border-slate-200 bg-white text-slate-700 shadow-2xl">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-55 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-slate-900 font-sans">
                HR Solutions Portal Dev Console
              </span>
              <span className="text-3xs font-mono text-slate-550">
                PORT 3000 CONSOLE | REPLICA OF LEGACY JAVA CONTROLLER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDb}
              className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-mono text-3xs font-semibold text-red-650 hover:bg-red-100 transition cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              Reset DB Sandbox
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-650 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer border border-slate-200"
            >
              Hide Console
            </button>
          </div>
        </div>

        {/* Console Mode Select Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
          <button
            onClick={() => setActiveTab("logs")}
            className={`border-b-2 px-4 py-3 text-xs font-mono font-medium transition cursor-pointer ${
              activeTab === "logs"
                ? "border-sky-500 text-sky-650"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Live Server Request Log ({logs.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("db");
              fetchDbData();
            }}
            className={`border-b-2 px-4 py-3 text-xs font-mono font-medium transition cursor-pointer ${
              activeTab === "db"
                ? "border-emerald-500 text-emerald-650"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            In-Memory Database States
          </button>
          <button
            onClick={() => setActiveTab("tester")}
            className={`border-b-2 px-4 py-3 text-xs font-mono font-medium transition cursor-pointer ${
              activeTab === "tester"
                ? "border-indigo-500 text-indigo-650"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            API Endpoint Client Tester
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs">
          
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-400">TIMESTAMP</span>
                <span className="text-xs text-slate-400">METHOD / ROUTE MATCHING</span>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p>No backend requests tracked yet.</p>
                  <p className="mt-1 text-2xs text-slate-500">Interact with the application, submit login or registration, then audit real endpoints here.</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="rounded-lg bg-slate-50 border border-slate-200 p-4 font-mono">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-3xs">{log.timestamp}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-3xs font-extrabold uppercase ${
                          log.method === "GET" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}>
                          {log.method}
                        </span>
                        <span className="text-slate-850 font-bold tracking-tight text-3xs sm:text-xs">
                          {log.path}
                        </span>
                      </div>
                      <span className="text-3xs text-slate-500 uppercase tracking-wider font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                        {log.path.includes("/users/getUserTypes") 
                          ? "Java: retrieveUserTypes()" 
                          : log.path.includes("/users/registerUser") 
                          ? "Java: registerUser()" 
                          : log.path.includes("/users/validateUser")
                          ? "Java: validateUser()" 
                          : log.path.includes("/users/userEmailAlreadyExists")
                          ? "Java: userIdAlreadyExists()"
                          : "Custom Portal Extension"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2 border-t border-slate-200 pt-2 text-3xs">
                      <div>
                        <span className="block text-slate-400 mb-1">RAW REQUEST PAYLOAD</span>
                        <pre className="overflow-x-auto rounded bg-white border border-slate-150 p-2.5 max-h-32 text-slate-700">
                          {log.requestBody}
                        </pre>
                      </div>
                      <div>
                        <span className="block text-slate-400 mb-1">RAW RESPONSE PAYLOAD</span>
                        <pre className="overflow-x-auto rounded bg-white border border-slate-150 p-2.5 max-h-32 text-slate-700">
                          {log.responseBody}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "db" && (
            <div>
              {/* Table Subselector */}
              <div className="flex gap-2 mb-4 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setActiveDbTable("users")}
                  className={`rounded-lg px-3 py-1 font-sans text-2xs font-semibold cursor-pointer border ${
                    activeDbTable === "users" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  [Users] Table ({dbUsers.length})
                </button>
                <button
                  onClick={() => setActiveDbTable("jobs")}
                  className={`rounded-lg px-3 py-1 font-sans text-2xs font-semibold cursor-pointer border ${
                    activeDbTable === "jobs" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  [Jobs] Table ({dbJobs.length})
                </button>
                <button
                  onClick={() => setActiveDbTable("apps")}
                  className={`rounded-lg px-3 py-1 font-sans text-2xs font-semibold cursor-pointer border ${
                    activeDbTable === "apps" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  [Applications] Table ({dbApps.length})
                </button>
                <button
                  onClick={() => setActiveDbTable("interviews")}
                  className={`rounded-lg px-3 py-1 font-sans text-2xs font-semibold cursor-pointer border ${
                    activeDbTable === "interviews" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  [Interviews] Table ({dbInterviews.length})
                </button>
              </div>

              {/* Data Table contents */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
                {activeDbTable === "users" && (
                  <table className="w-full text-left text-3xs sm:text-2xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400">
                        <th className="py-2 pr-2">ID</th>
                        <th className="py-2 pr-2">EMAIL</th>
                        <th className="py-2 pr-2">ROLE_ID</th>
                        <th className="py-2 pr-2">NAME</th>
                        <th className="py-2 pr-2">CONTACT</th>
                        <th className="py-2 pr-2">CREATED</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-600">
                      {dbUsers.map(user => (
                        <tr key={user.id}>
                          <td className="py-2 pr-2 font-bold text-sky-600">{user.id}</td>
                          <td className="py-2 pr-2">{user.userEmail}</td>
                          <td className="py-2 pr-2">
                            <span className="rounded bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-indigo-700 font-bold uppercase text-3xs">
                              {user.userTypeId === 1 ? "CAND (1)" : user.userTypeId === 2 ? "COMP (2)" : "INTVR (3)"}
                            </span>
                          </td>
                          <td className="py-2 pr-2 font-sans font-semibold text-slate-800">{user.firstName} {user.lastName}</td>
                          <td className="py-2 pr-2">{user.contactNo}</td>
                          <td className="py-2 pr-2 text-slate-400 font-mono text-3xs">{new Date(user.createdOn).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeDbTable === "jobs" && (
                  <table className="w-full text-left text-3xs sm:text-2xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400">
                        <th className="py-2 pr-2">ID</th>
                        <th className="py-2 pr-2">TITLE</th>
                        <th className="py-2 pr-2">COMPANY</th>
                        <th className="py-2 pr-2">LOCATION</th>
                        <th className="py-2 pr-2">SALARY</th>
                        <th className="py-2 pr-2">TARGET_SKILLS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-600">
                      {dbJobs.map(job => (
                        <tr key={job.id}>
                          <td className="py-2 pr-2 font-bold text-sky-600">{job.id}</td>
                          <td className="py-2 pr-2 font-sans font-semibold text-slate-800">{job.title}</td>
                          <td className="py-2 pr-2 text-slate-500">{job.companyName}</td>
                          <td className="py-2 pr-2">{job.location}</td>
                          <td className="py-2 pr-2 text-emerald-600 font-bold">{job.salary}</td>
                          <td className="py-2 pr-2">
                            <div className="flex flex-wrap gap-1">
                              {job.skills.map((s, idx) => (
                                <span key={idx} className="rounded bg-white px-1.5 py-0.5 cursor-default text-3xs text-slate-600 border border-slate-200">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeDbTable === "apps" && (
                  <table className="w-full text-left text-3xs sm:text-2xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400">
                        <th className="py-2 pr-2">APP_ID</th>
                        <th className="py-2 pr-2">JOB</th>
                        <th className="py-2 pr-1">APPLICANT</th>
                        <th className="py-2 pr-2">EMAIL</th>
                        <th className="py-2 pr-2">STATUS</th>
                        <th className="py-2 pr-2">SUBMITTED</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-600">
                      {dbApps.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400">No applicant submittals yet.</td>
                        </tr>
                      ) : (
                        dbApps.map(app => (
                          <tr key={app.id}>
                            <td className="py-2 pr-2 font-bold text-sky-600">{app.id}</td>
                            <td className="py-2 pr-2 font-sans font-medium text-slate-800">{app.jobTitle}</td>
                            <td className="py-2 pr-1">{app.candidateName}</td>
                            <td className="py-2 pr-2 text-slate-500">{app.candidateEmail}</td>
                            <td className="py-2 pr-2">
                              <span className={`inline-block rounded px-1.5 py-0.5 text-3xs font-semibold ${
                                app.status === "Interview Scheduled" 
                                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                                  : app.status === "Rejected"
                                  ? "bg-red-50 text-red-700 border border-red-100"
                                  : app.status === "Accepted"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-blue-50 text-blue-700 border border-blue-100"
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-2 pr-2 font-mono text-3xs text-slate-400">{new Date(app.appliedOn).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {activeDbTable === "interviews" && (
                  <table className="w-full text-left text-3xs sm:text-2xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400">
                        <th className="py-2 pr-2">INT_ID</th>
                        <th className="py-2 pr-2">CANDIDATE</th>
                        <th className="py-2 pr-1">POSITION</th>
                        <th className="py-2 pr-2">INTERVIEWER</th>
                        <th className="py-2 pr-2">SLOT</th>
                        <th className="py-2 pr-2">EVALUATION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-600">
                      {dbInterviews.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400">No scheduled recruitment panels yet.</td>
                        </tr>
                      ) : (
                        dbInterviews.map(intv => (
                          <tr key={intv.id}>
                            <td className="py-2 pr-2 font-bold text-sky-600">{intv.id}</td>
                            <td className="py-2 pr-2 font-sans text-slate-850">{intv.candidateName}</td>
                            <td className="py-2 pr-1 text-slate-500">{intv.jobTitle}</td>
                            <td className="py-2 pr-2 font-sans">{intv.interviewerName}</td>
                            <td className="py-2 pr-2 text-indigo-600">{intv.dateTime.replace("T", " ")}</td>
                            <td className="py-2 pr-2">
                              {intv.evaluation ? (
                                <span className="text-emerald-750 font-sans text-3xs font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                  Tech: {intv.evaluation.technicalScore}/10 | Soft: {intv.evaluation.softSkillsScore}/10
                                </span>
                              ) : (
                                <span className="text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100 text-3xs font-semibold">Pending Evaluation</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === "tester" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <span className="block text-2xs font-bold text-slate-400 uppercase">Input parameters</span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-3xs text-slate-400 mb-1">METHOD</label>
                    <select
                      value={apiMethod}
                      onChange={(e) => {
                        const m = e.target.value;
                        setApiMethod(m);
                        if (m === "GET") setApiPath("/api/users/getUserTypes/");
                        else setApiPath("/api/users/userEmailAlreadyExists/");
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-3xs text-slate-700 focus:outline-none"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-3xs text-slate-400 mb-1">ENDPOINT PATH</label>
                    <select
                      value={apiPath}
                      onChange={(e) => setApiPath(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-3xs text-slate-700 focus:outline-none"
                    >
                      {apiMethod === "GET" ? (
                        <>
                          <option value="/api/users/getUserTypes/">/api/users/getUserTypes/ (retrieveUserTypes)</option>
                          <option value="/api/users/testHello/">/api/users/testHello/ (testHello)</option>
                        </>
                      ) : (
                        <>
                          <option value="/api/users/userEmailAlreadyExists/">/api/users/userEmailAlreadyExists/</option>
                          <option value="/api/users/validateUser/">/api/users/validateUser/</option>
                          <option value="/api/users/registerUser/">/api/users/registerUser/</option>
                          <option value="/api/users/resetPassword/">/api/users/resetPassword/</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {apiMethod === "POST" && (
                  <div>
                    <label className="block text-3xs text-slate-400 mb-1">RAW JSON REQUEST BODY</label>
                    <textarea
                      rows={5}
                      value={apiBody}
                      onChange={(e) => setApiBody(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-3xs text-slate-800 font-mono focus:outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={handleRunTester}
                  disabled={loadingTester}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-sans font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer"
                >
                  <Play className="h-4 w-4" />
                  {loadingTester ? "Request executing..." : "Execute API Request"}
                </button>
              </div>

              <div>
                <span className="block text-2xs font-bold text-slate-400 uppercase mb-2">JSON response from server</span>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 h-[300px] overflow-auto">
                  {testerResult ? (
                    <pre className="text-slate-800 font-mono text-3xs leading-relaxed whitespace-pre-wrap">
                      {testerResult}
                    </pre>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      Execute a request to view formatted server logs.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
