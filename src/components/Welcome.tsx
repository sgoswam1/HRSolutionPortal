import React from "react";
import { User } from "../types";
import { CheckCircle2, UserCheck, Code, Settings, Server, ArrowRight, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { usePreferences } from "../context/PreferencesContext";

interface WelcomeProps {
  currentUser: User | null;
  onQuickLogin: (email: string) => void;
  activeSection: string;
  onRegisterClick: () => void;
}

export default function Welcome({
  currentUser,
  onQuickLogin,
  activeSection,
  onRegisterClick
}: WelcomeProps) {
  const { styles } = usePreferences();

  // If user clicks About or Contact nav buttons, let's render those views eleganty inside this view
  if (activeSection === "about") {
    return (
      <div className={`mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 transition-colors duration-200 ${styles.text}`}>
        <div className={`rounded-3xl border p-8 shadow-sm ${styles.panel}`}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <Server className="h-4 w-4" /> About legacy architecture
          </span>
          <h1 className={`mt-4 font-sans text-3xl font-bold tracking-tight sm:text-4xl ${styles.heading}`}>
            Legacy Application Architecture
          </h1>
          <p className={`mt-3 text-lg leading-relaxed ${styles.subtext}`}>
            This module represents a direct porting and modernization of the original enterprise C# Web application and Java APIs.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className={`rounded-2xl border p-6 ${styles.panel} bg-slate-50/10`}>
              <h3 className={`flex items-center gap-2 font-mono text-sm font-semibold ${styles.heading}`}>
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Original C# View Application
              </h3>
              <p className={`mt-2 text-xs leading-relaxed ${styles.subtext}`}>
                The original visual layer used **ASP.NET MVC 5** Razor layout models (<code className="bg-slate-100/30 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">_Layout.cshtml</code>) paired with the <code className="bg-slate-100/30 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">UserLoginController.cs</code> system. The core registration views bound details to <code className="bg-slate-100/30 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">UserDetailsViewModel.cs</code> containing validated fields (Email verification patterns, Contact attributes).
              </p>
            </div>

            <div className={`rounded-2xl border p-6 ${styles.panel} bg-slate-50/10`}>
              <h3 className={`flex items-center gap-2 font-mono text-sm font-semibold ${styles.heading}`}>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Original Java Spring Boot REST API
              </h3>
              <p className={`mt-2 text-xs leading-relaxed ${styles.subtext}`}>
                Core backend operations were serviced via an standalone Java Maven project (<code className="bg-slate-100/30 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">pom.xml</code>) declaring the controller class <code className="bg-slate-100/30 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">UserController.java</code>. This mapped standard annotations such as <code className="bg-slate-100/30 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">@PostMapping("/users/registerUser/")</code>, <code className="bg-slate-100/30 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">@RequestBody</code> parsing, and Hibernate Validation.
              </p>
            </div>
          </div>

          <div className={`mt-8 border-t pt-6 ${styles.border}`}>
            <h2 className={`text-xl font-bold ${styles.heading}`}>Modernized Stack Mapping</h2>
            <p className={`mt-2 text-sm ${styles.subtext}`}>
              The ported modern code leverages **TypeScript**, **React**, and **Tailwind CSS** to render a fluid web app running continuously inside container pods, while a Node.js full-stack **Express API** performs exact replica bindings of legacy security validation methods.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "contact") {
    return (
      <div className={`mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 transition-colors duration-200 ${styles.text}`}>
        <div className={`rounded-3xl border p-8 shadow-sm ${styles.panel}`}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
            <Phone className="h-4 w-4" /> Contact Us
          </span>
          <h1 className={`mt-4 font-sans text-3xl font-bold tracking-tight sm:text-4xl ${styles.heading}`}>
            HRSolutions Support Desk
          </h1>
          <p className={`mt-3 text-lg leading-relaxed ${styles.subtext}`}>
            Our systems management team is ready to assist your organization with recruitment workflow setups and legacy migrations.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className={`rounded-2xl border p-6 text-center ${styles.panel} bg-slate-50/10`}>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 shadow-xs">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className={`mt-3 text-sm font-semibold ${styles.heading}`}>General Inquiry</h3>
              <p className={`mt-1 font-mono text-xs ${styles.subtext}`}>Dip.Subha@gmail.com</p>
            </div>

            <div className={`rounded-2xl border p-6 text-center ${styles.panel} bg-slate-50/10`}>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className={`mt-3 text-sm font-semibold ${styles.heading}`}>Phone Hotline</h3>
              <p className={`mt-1 font-mono text-xs ${styles.subtext}`}>+1 (555) 765-8902</p>
            </div>

            <div className={`rounded-2xl border p-6 text-center ${styles.panel} bg-slate-50/10`}>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shadow-xs">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className={`mt-3 text-sm font-semibold ${styles.heading}`}>Global Headquarter</h3>
              <p className={`mt-1 font-mono text-xs ${styles.subtext}`}>Silicon Valley, CA, USA</p>
            </div>
          </div>

          <div className={`mt-8 border-t pt-8 ${styles.border}`}>
            <h3 className={`text-lg font-bold ${styles.heading}`}>Send an Express Feedback Message</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={`block text-xs font-semibold ${styles.subtext}`}>Your Full Name</label>
                <input type="text" className={`mt-1.5 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-sky-500 ${styles.input}`} placeholder="Alex Candidate" />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${styles.subtext}`}>Email Address</label>
                <input type="email" className={`mt-1.5 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-sky-500 ${styles.input}`} placeholder="alex@gmail.com" />
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-xs font-semibold ${styles.subtext}`}>Message Body</label>
                <textarea rows={3} className={`mt-1.5 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-sky-500 ${styles.input}`} placeholder="Write your legacy questions..."></textarea>
              </div>
              <div className="sm:col-span-2 text-right">
                <button 
                  onClick={() => alert("Feedback sent! This acts as an interactive simulation container demo.")}
                  className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 transition cursor-pointer"
                >
                  Send Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200 ${styles.text}`}>
      {/* Hero Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/40 px-3 py-1 text-xs font-medium text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900">
          <Code className="h-3.5 w-3.5" /> Full-Stack Spring Boot & C# MVC Modernization
        </span>
        <h1 className={`mt-4 font-sans text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${styles.heading}`}>
          HR Solutions Application
        </h1>
        <p className={`mx-auto mt-5 max-w-2xl text-lg ${styles.subtext}`}>
          An ecosystem representing unified candidate hiring pipeline, company postings, and expert interviewer feedback management. Real-time persistent state synced via backend Node controllers.
        </p>

        {!currentUser && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={onRegisterClick}
              className="group flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white shadow-xl shadow-sky-100 dark:shadow-none hover:bg-sky-500 transition-all cursor-pointer"
            >
              Get Started with Portal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>

      {/* Role Personas Quick Showcase */}
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {/* Candidate Persona Card */}
        <div className={`rounded-3xl border p-8 shadow-xs hover:border-sky-300 dark:hover:border-sky-700 transition ${styles.panel}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold text-lg">
            C
          </div>
          <h2 className={`mt-4 text-xl font-bold ${styles.heading}`}>1. Candidate Portal</h2>
          <p className={`mt-2 text-sm ${styles.subtext}`}>
            For job seekers and profile managers. Search active openings, submit custom reviews, track timeline application states, and perform AI Resume evaluations.
          </p>

          <div className={`mt-6 border-t pt-4 space-y-2 ${styles.border}`}>
            <span className={`block text-xs font-semibold font-mono tracking-wider ${styles.subtext}`}>DEMO PROFILES</span>
            <button
              onClick={() => onQuickLogin("candidate@demo.com")}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition cursor-pointer ${styles.buttonSecondary}`}
            >
              <span>Alex Candidate (Scheduled)</span>
              <span className="font-mono text-3xs text-sky-600 dark:text-sky-400 uppercase font-bold">Sign In</span>
            </button>
            <button
              onClick={() => onQuickLogin("fresh@candidate.com")}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition cursor-pointer ${styles.buttonSecondary}`}
            >
              <span>Felix Fresh (No applications)</span>
              <span className="font-mono text-3xs text-sky-600 dark:text-sky-400 uppercase font-bold">Sign In</span>
            </button>
            <button
              onClick={() => onQuickLogin("liam@candidate.com")}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition cursor-pointer ${styles.buttonSecondary}`}
            >
              <span>Liam LegacyDev (Accepted)</span>
              <span className="font-mono text-3xs text-sky-600 dark:text-sky-400 uppercase font-bold">Sign In</span>
            </button>
          </div>
        </div>

        {/* Company Persona Card */}
        <div className={`rounded-3xl border p-8 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition ${styles.panel}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
            H
          </div>
          <h2 className={`mt-4 text-xl font-bold ${styles.heading}`}>2. HR Solutions / Company</h2>
          <p className={`mt-2 text-sm ${styles.subtext}`}>
            For recruiters and HR leaders. Post fresh job items, screen overall applicants, move applicants along stages, and assign dedicated interview times.
          </p>

          <div className={`mt-6 border-t pt-4 space-y-2 ${styles.border}`}>
            <span className={`block text-xs font-semibold font-mono tracking-wider ${styles.subtext}`}>DEMO PROFILES</span>
            <button
              onClick={() => onQuickLogin("hr@company.com")}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition cursor-pointer ${styles.buttonSecondary}`}
            >
              <span>Sophia HR Manager</span>
              <span className="font-mono text-3xs text-indigo-600 dark:text-indigo-400 uppercase font-bold">Sign In</span>
            </button>
            <button
              onClick={() => onQuickLogin("recruiter@company.com")}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition cursor-pointer ${styles.buttonSecondary}`}
            >
              <span>Marcus Recruiter</span>
              <span className="font-mono text-3xs text-indigo-600 dark:text-indigo-400 uppercase font-bold">Sign In</span>
            </button>
          </div>
        </div>

        {/* Interviewer Persona Card */}
        <div className={`rounded-3xl border p-8 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition ${styles.panel}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold text-lg">
            I
          </div>
          <h2 className={`mt-4 text-xl font-bold ${styles.heading}`}>3. Interviewer Portal</h2>
          <p className={`mt-2 text-sm ${styles.subtext}`}>
            For tech panels and evaluators. Keep track of assigned video slots, input official scorecard assessments (tech/soft/fit/critique), and archive evaluations.
          </p>

          <div className={`mt-6 border-t pt-4 space-y-2 ${styles.border}`}>
            <span className={`block text-xs font-semibold font-mono tracking-wider ${styles.subtext}`}>DEMO PROFILES</span>
            <button
              onClick={() => onQuickLogin("john@interviewer.com")}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition cursor-pointer ${styles.buttonSecondary}`}
            >
              <span>John Interviewer</span>
              <span className="font-mono text-3xs text-purple-600 dark:text-purple-400 uppercase font-bold">Sign In</span>
            </button>
            <button
              onClick={() => onQuickLogin("elena@interviewer.com")}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition cursor-pointer ${styles.buttonSecondary}`}
            >
              <span>Elena Architect</span>
              <span className="font-mono text-3xs text-purple-600 dark:text-purple-400 uppercase font-bold">Sign In</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Architectural Highlights */}
      <div className={`mt-20 border-t pt-12 ${styles.border}`}>
        <h3 className={`text-center font-sans text-2xl font-bold tracking-tight ${styles.heading}`}>
          How this application is structured & verified
        </h3>
        <p className="text-center font-mono text-xs text-sky-600 dark:text-sky-400 mt-1 font-semibold">
          Mapped directly from sgoswam1/HRSolutionsApplication
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`flex gap-3 border p-5 rounded-2xl shadow-xs ${styles.panel}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold font-mono ${styles.heading}`}>Dynamic User Check</h4>
              <p className={`mt-1.5 text-xs leading-normal ${styles.subtext}`}>
                Implements the <code className="bg-slate-100/30 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 text-3xs">CheckIfUserEmailAlreadyExists</code> method live directly before letting a candidate create an account.
              </p>
            </div>
          </div>

          <div className={`flex gap-3 border p-5 rounded-2xl shadow-xs ${styles.panel}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold font-mono ${styles.heading}`}>Java Spring controller</h4>
              <p className={`mt-1.5 text-xs leading-normal ${styles.subtext}`}>
                Submits payload to real HTTP POST/GET paths replica mimicking Java Spring annotation structures.
              </p>
            </div>
          </div>

          <div className={`flex gap-3 border p-5 rounded-2xl shadow-xs ${styles.panel}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold font-mono ${styles.heading}`}>Developer Log Sandbox</h4>
              <p className={`mt-1.5 text-xs leading-normal ${styles.subtext}`}>
                Analyze and inspect the matching raw REST API queries running behind the scenes as you submit forms in real time!
              </p>
            </div>
          </div>

          <div className={`flex gap-3 border p-5 rounded-2xl shadow-xs ${styles.panel}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold font-mono ${styles.heading}`}>Gemini AI suggestions</h4>
              <p className={`mt-1.5 text-xs leading-normal ${styles.subtext}`}>
                Uses Google GenAI models on the server to review candidate resumes vs job needs and output structural reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
