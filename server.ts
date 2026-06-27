import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { User, UserType, Job, Application, Interview } from "./src/types";

// Setup server App
const app = express();
const PORT = 3000;

app.use(express.json());

// Normalize req.url to start with /api for Vercel routing
app.use((req, res, next) => {
  if (process.env.VERCEL) {
    const url = req.url || "/";
    if (!url.startsWith("/api")) {
      req.url = "/api" + url;
    }
  }
  next();
});

// In-Memory Database State
const userTypes: UserType[] = [
  { UserTypeId: 1, UserTypeCode: "CAND", UserTypeDesc: "Candidate" },
  { UserTypeId: 2, UserTypeCode: "COMP", UserTypeDesc: "Company" },
  { UserTypeId: 3, UserTypeCode: "INTVR", UserTypeDesc: "Interviewer" }
];

let users: User[] = [
  {
    id: 1,
    userEmail: "candidate@demo.com",
    password: "password123",
    userTypeId: 1,
    firstName: "Alex",
    lastName: "Candidate",
    contactNo: "1234567890",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  {
    id: 2,
    userEmail: "hr@company.com",
    password: "password123",
    userTypeId: 2,
    firstName: "Sophia",
    lastName: "HR",
    contactNo: "9876543210",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  {
    id: 3,
    userEmail: "john@interviewer.com",
    password: "password123",
    userTypeId: 3,
    firstName: "John",
    lastName: "Interviewer",
    contactNo: "5551234567",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  {
    id: 4,
    userEmail: "emma@candidate.com",
    password: "password123",
    userTypeId: 1,
    firstName: "Emma",
    lastName: "Sourcing",
    contactNo: "5559871234",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  {
    id: 5,
    userEmail: "liam@candidate.com",
    password: "password123",
    userTypeId: 1,
    firstName: "Liam",
    lastName: "LegacyDev",
    contactNo: "5558883321",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  {
    id: 6,
    userEmail: "sarah@candidate.com",
    password: "password123",
    userTypeId: 1,
    firstName: "Sarah",
    lastName: "Beginner",
    contactNo: "5552220099",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  {
    id: 7,
    userEmail: "fresh@candidate.com",
    password: "password123",
    userTypeId: 1,
    firstName: "Felix",
    lastName: "Fresh",
    contactNo: "5551112222",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  {
    id: 8,
    userEmail: "recruiter@company.com",
    password: "password123",
    userTypeId: 2,
    firstName: "Marcus",
    lastName: "Recruiter",
    contactNo: "5554443333",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  {
    id: 9,
    userEmail: "elena@interviewer.com",
    password: "password123",
    userTypeId: 3,
    firstName: "Elena",
    lastName: "Architect",
    contactNo: "5556667777",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  {
    id: 10,
    userEmail: "daniel@interviewer.com",
    password: "password123",
    userTypeId: 3,
    firstName: "Daniel",
    lastName: "TechLead",
    contactNo: "5558889999",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  },
  {
    id: 11,
    userEmail: "david.miller@demo.com",
    password: "password123",
    userTypeId: 1,
    firstName: "David",
    lastName: "Miller",
    contactNo: "5550005555",
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
  }
];

let jobs: Job[] = [
  {
    id: 1,
    title: "Senior Full-Stack Engineer",
    companyName: "HRSolutions Corp",
    location: "Remote / San Francisco",
    salary: "$120,000 - $150,000",
    description: "Looking for an experienced engineer skilled in Node.js, Express, and React to spearhead core UI refactorings.",
    skills: ["React", "Express", "TypeScript", "Node.js"],
    createdOn: new Date().toISOString()
  },
  {
    id: 2,
    title: "Senior Technical Talent Recruiter",
    companyName: "HR Solutions Portal",
    location: "New York, NY",
    salary: "$90,000 - $110,000",
    description: "Join our HR development group where you can coordinate with candidates, companies, and top internal interviewers.",
    skills: ["Interviews", "Communication", "Sourcing", "HRIS"],
    createdOn: new Date().toISOString()
  },
  {
    id: 3,
    title: "Java & C# Dev Specialist",
    companyName: "Migration Solutions LLC",
    location: "Hybrid / Chicago",
    salary: "$130,000 - $160,000",
    description: "Help clients migrate legacy C# ASP.NET MVC architectures and Spring Boot Rest API servers into React/Express cloud native web layers.",
    skills: ["Java", "C#", "Spring Boot", ".NET", "React"],
    createdOn: new Date().toISOString()
  },
  {
    id: 4,
    title: "Cloud Infrastructure Architect",
    companyName: "CloudScaling Co",
    location: "Remote / Austin",
    salary: "$150,000 - $190,000",
    description: "Architect secure high-availability infrastructure deployments using containers, Kubernetes, and automated CI/CD pipelines.",
    skills: ["Kubernetes", "Docker", "CI/CD", "AWS", "Terraform"],
    createdOn: new Date().toISOString()
  },
  {
    id: 5,
    title: "Junior React Developer",
    companyName: "StartupLab Pty Ltd",
    location: "Onsite / Boston",
    salary: "$75,000 - $95,000",
    description: "Excellent starting opportunity for a frontend development graduate passionate about React, client state hooks, and Tailwind CSS layouts.",
    skills: ["React", "CSS", "Tailwind Playgrounds", "Git"],
    createdOn: new Date().toISOString()
  }
];

let applications: Application[] = [
  {
    id: 1,
    jobId: 1,
    jobTitle: "Senior Full-Stack Engineer",
    companyName: "HRSolutions Corp",
    candidateId: 1,
    candidateName: "Alex Candidate",
    candidateEmail: "candidate@demo.com",
    status: "Interview Scheduled",
    appliedOn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    experience: "5 years of experience building scalable Javascript & TypeScript apps.",
    coverLetter: "I'm extremely passionate about code clarity and rapid refactors."
  },
  {
    id: 2,
    jobId: 2,
    jobTitle: "Senior Technical Talent Recruiter",
    companyName: "HR Solutions Portal",
    candidateId: 4,
    candidateName: "Emma Sourcing",
    candidateEmail: "emma@candidate.com",
    status: "Applied",
    appliedOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    experience: "4 years sourcing tech talent at cloud-native development companies.",
    coverLetter: "I love pairing developers with perfect assignments that suit their passion."
  },
  {
    id: 3,
    jobId: 3,
    jobTitle: "Java & C# Dev Specialist",
    companyName: "Migration Solutions LLC",
    candidateId: 5,
    candidateName: "Liam LegacyDev",
    candidateEmail: "liam@candidate.com",
    status: "Accepted",
    appliedOn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    experience: "8 years of legacy architecture migration, specifically targeting C# MVC models to TypeScript servers.",
    coverLetter: "I enjoy writing clean adapter classes and bridging runtime gaps."
  },
  {
    id: 4,
    jobId: 1,
    jobTitle: "Senior Full-Stack Engineer",
    companyName: "HRSolutions Corp",
    candidateId: 6,
    candidateName: "Sarah Beginner",
    candidateEmail: "sarah@candidate.com",
    status: "Rejected",
    appliedOn: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    experience: "Recent bootcamp graduate eager to learn and code React components full-time.",
    coverLetter: "Looking for an inclusive environment to pair-program and grow."
  },
  {
    id: 5,
    jobId: 1,
    jobTitle: "Senior Full-Stack Engineer",
    companyName: "HRSolutions Corp",
    candidateId: 11,
    candidateName: "David Miller",
    candidateEmail: "david.miller@demo.com",
    status: "Reviewed",
    appliedOn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    experience: "6 years of Frontend & Full-stack design systems, building accessible component utilities.",
    coverLetter: "I focus deeply on semantic markup structures, responsive flexboxes, and micro-interactions."
  }
];

let interviews: Interview[] = [
  {
    id: 1,
    applicationId: 1,
    candidateName: "Alex Candidate",
    jobTitle: "Senior Full-Stack Engineer",
    interviewerId: 3,
    interviewerName: "John Interviewer",
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
    status: "Scheduled"
  },
  {
    id: 2,
    applicationId: 3,
    candidateName: "Liam LegacyDev",
    jobTitle: "Java & C# Dev Specialist",
    interviewerId: 3,
    interviewerName: "John Interviewer",
    dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
    status: "Completed",
    evaluation: {
      technicalScore: 9,
      softSkillsScore: 8,
      cultureFitScore: 9,
      notes: "Exceptional mastery of Java Spring controller behaviors and database thread-pooling logic. Solved the legacy data-migration design task efficiently. Soft skills: friendly and has amazing architectural clarity.",
      submittedOn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: 3,
    applicationId: 4,
    candidateName: "Sarah Beginner",
    jobTitle: "Senior Full-Stack Engineer",
    interviewerId: 9,
    interviewerName: "Elena Architect",
    dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
    status: "Completed",
    evaluation: {
      technicalScore: 4,
      softSkillsScore: 9,
      cultureFitScore: 8,
      notes: "Sarah has phenomenal soft skills and highly energetic culture values. However, she struggled with live styling hooks, asynchronous state race triggers, and React memoization concepts. We recommend declining the Senior post but keeping her file open for upcoming Junior Associate roles.",
      submittedOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: 4,
    applicationId: 5,
    candidateName: "David Miller",
    jobTitle: "Senior Full-Stack Engineer",
    interviewerId: 10,
    interviewerName: "Daniel TechLead",
    dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
    status: "Scheduled"
  }
];

// Helper to reset sandbox
function resetDatabase() {
  users = [
    {
      id: 1,
      userEmail: "candidate@demo.com",
      password: "password123",
      userTypeId: 1,
      firstName: "Alex",
      lastName: "Candidate",
      contactNo: "1234567890",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    },
    {
      id: 2,
      userEmail: "hr@company.com",
      password: "password123",
      userTypeId: 2,
      firstName: "Sophia",
      lastName: "HR",
      contactNo: "9876543210",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    },
    {
      id: 3,
      userEmail: "john@interviewer.com",
      password: "password123",
      userTypeId: 3,
      firstName: "John",
      lastName: "Interviewer",
      contactNo: "5551234567",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    },
    {
      id: 4,
      userEmail: "emma@candidate.com",
      password: "password123",
      userTypeId: 1,
      firstName: "Emma",
      lastName: "Sourcing",
      contactNo: "5559871234",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    },
    {
      id: 5,
      userEmail: "liam@candidate.com",
      password: "password123",
      userTypeId: 1,
      firstName: "Liam",
      lastName: "LegacyDev",
      contactNo: "5558883321",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    },
    {
      id: 6,
      userEmail: "sarah@candidate.com",
      password: "password123",
      userTypeId: 1,
      firstName: "Sarah",
      lastName: "Beginner",
      contactNo: "5552220099",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    },
    {
      id: 7,
      userEmail: "fresh@candidate.com",
      password: "password123",
      userTypeId: 1,
      firstName: "Felix",
      lastName: "Fresh",
      contactNo: "5551112222",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    },
    {
      id: 8,
      userEmail: "recruiter@company.com",
      password: "password123",
      userTypeId: 2,
      firstName: "Marcus",
      lastName: "Recruiter",
      contactNo: "5554443333",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    },
    {
      id: 9,
      userEmail: "elena@interviewer.com",
      password: "password123",
      userTypeId: 3,
      firstName: "Elena",
      lastName: "Architect",
      contactNo: "5556667777",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    },
    {
      id: 10,
      userEmail: "daniel@interviewer.com",
      password: "password123",
      userTypeId: 3,
      firstName: "Daniel",
      lastName: "TechLead",
      contactNo: "5558889999",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    },
    {
      id: 11,
      userEmail: "david.miller@demo.com",
      password: "password123",
      userTypeId: 1,
      firstName: "David",
      lastName: "Miller",
      contactNo: "5550005555",
      isActive: 1,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    }
  ];

  jobs = [
    {
      id: 1,
      title: "Senior Full-Stack Engineer",
      companyName: "HRSolutions Corp",
      location: "Remote / San Francisco",
      salary: "$120,000 - $150,000",
      description: "Looking for an experienced engineer skilled in Node.js, Express, and React to spearhead core UI refactorings.",
      skills: ["React", "Express", "TypeScript", "Node.js"],
      createdOn: new Date().toISOString()
    },
    {
      id: 2,
      title: "Senior Technical Talent Recruiter",
      companyName: "HR Solutions Portal",
      location: "New York, NY",
      salary: "$90,000 - $110,000",
      description: "Join our HR development group where you can coordinate with candidates, companies, and top internal interviewers.",
      skills: ["Interviews", "Communication", "Sourcing", "HRIS"],
      createdOn: new Date().toISOString()
    },
    {
      id: 3,
      title: "Java & C# Dev Specialist",
      companyName: "Migration Solutions LLC",
      location: "Hybrid / Chicago",
      salary: "$130,000 - $160,000",
      description: "Help clients migrate legacy C# ASP.NET MVC architectures and Spring Boot Rest API servers into React/Express cloud native web layers.",
      skills: ["Java", "C#", "Spring Boot", ".NET", "React"],
      createdOn: new Date().toISOString()
    },
    {
      id: 4,
      title: "Cloud Infrastructure Architect",
      companyName: "CloudScaling Co",
      location: "Remote / Austin",
      salary: "$150,000 - $190,000",
      description: "Architect secure high-availability infrastructure deployments using containers, Kubernetes, and automated CI/CD pipelines.",
      skills: ["Kubernetes", "Docker", "CI/CD", "AWS", "Terraform"],
      createdOn: new Date().toISOString()
    },
    {
      id: 5,
      title: "Junior React Developer",
      companyName: "StartupLab Pty Ltd",
      location: "Onsite / Boston",
      salary: "$75,000 - $95,000",
      description: "Excellent starting opportunity for a frontend development graduate passionate about React, client state hooks, and Tailwind CSS layouts.",
      skills: ["React", "CSS", "Tailwind Playgrounds", "Git"],
      createdOn: new Date().toISOString()
    }
  ];

  applications = [
    {
      id: 1,
      jobId: 1,
      jobTitle: "Senior Full-Stack Engineer",
      companyName: "HRSolutions Corp",
      candidateId: 1,
      candidateName: "Alex Candidate",
      candidateEmail: "candidate@demo.com",
      status: "Interview Scheduled",
      appliedOn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      experience: "5 years of experience building scalable Javascript & TypeScript apps.",
      coverLetter: "I'm extremely passionate about code clarity and rapid refactors."
    },
    {
      id: 2,
      jobId: 2,
      jobTitle: "Senior Technical Talent Recruiter",
      companyName: "HR Solutions Portal",
      candidateId: 4,
      candidateName: "Emma Sourcing",
      candidateEmail: "emma@candidate.com",
      status: "Applied",
      appliedOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      experience: "4 years sourcing tech talent at cloud-native development companies.",
      coverLetter: "I love pairing developers with perfect assignments that suit their passion."
    },
    {
      id: 3,
      jobId: 3,
      jobTitle: "Java & C# Dev Specialist",
      companyName: "Migration Solutions LLC",
      candidateId: 5,
      candidateName: "Liam LegacyDev",
      candidateEmail: "liam@candidate.com",
      status: "Accepted",
      appliedOn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      experience: "8 years of legacy architecture migration, specifically targeting C# MVC models to TypeScript servers.",
      coverLetter: "I enjoy writing clean adapter classes and bridging runtime gaps."
    },
    {
      id: 4,
      jobId: 1,
      jobTitle: "Senior Full-Stack Engineer",
      companyName: "HRSolutions Corp",
      candidateId: 6,
      candidateName: "Sarah Beginner",
      candidateEmail: "sarah@candidate.com",
      status: "Rejected",
      appliedOn: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      experience: "Recent bootcamp graduate eager to learn and code React components full-time.",
      coverLetter: "Looking for an inclusive environment to pair-program and grow."
    },
    {
      id: 5,
      jobId: 1,
      jobTitle: "Senior Full-Stack Engineer",
      companyName: "HRSolutions Corp",
      candidateId: 11,
      candidateName: "David Miller",
      candidateEmail: "david.miller@demo.com",
      status: "Reviewed",
      appliedOn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      experience: "6 years of Frontend & Full-stack design systems, building accessible component utilities.",
      coverLetter: "I focus deeply on semantic markup structures, responsive flexboxes, and micro-interactions."
    }
  ];

  interviews = [
    {
      id: 1,
      applicationId: 1,
      candidateName: "Alex Candidate",
      jobTitle: "Senior Full-Stack Engineer",
      interviewerId: 3,
      interviewerName: "John Interviewer",
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
      status: "Scheduled"
    },
    {
      id: 2,
      applicationId: 3,
      candidateName: "Liam LegacyDev",
      jobTitle: "Java & C# Dev Specialist",
      interviewerId: 3,
      interviewerName: "John Interviewer",
      dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
      status: "Completed",
      evaluation: {
        technicalScore: 9,
        softSkillsScore: 8,
        cultureFitScore: 9,
        notes: "Exceptional mastery of Java Spring controller behaviors and database thread-pooling logic. Solved the legacy data-migration design task efficiently. Soft skills: friendly and has amazing architectural clarity.",
        submittedOn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      id: 3,
      applicationId: 4,
      candidateName: "Sarah Beginner",
      jobTitle: "Senior Full-Stack Engineer",
      interviewerId: 9,
      interviewerName: "Elena Architect",
      dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
      status: "Completed",
      evaluation: {
        technicalScore: 4,
        softSkillsScore: 9,
        cultureFitScore: 8,
        notes: "Sarah has phenomenal soft skills and highly energetic culture values. However, she struggled with live styling hooks, asynchronous state race triggers, and React memoization concepts. We recommend declining the Senior post but keeping her file open for upcoming Junior Associate roles.",
        submittedOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      id: 4,
      applicationId: 5,
      candidateName: "David Miller",
      jobTitle: "Senior Full-Stack Engineer",
      interviewerId: 10,
      interviewerName: "Daniel TechLead",
      dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
      status: "Scheduled"
    }
  ];
}

// Lazy init Gemini Client
let ai: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// Logger Simulation Helper
const apiLogs: Array<{ timestamp: string; method: string; path: string; requestBody: string; responseBody: string }> = [];
function logRequest(req: Request, resBody: any) {
  apiLogs.unshift({
    timestamp: new Date().toLocaleTimeString(),
    method: req.method,
    path: req.originalUrl,
    requestBody: req.method !== 'GET' ? JSON.stringify(req.body) : 'N/A',
    responseBody: JSON.stringify(resBody)
  });
  if (apiLogs.length > 50) apiLogs.pop();
}

// ----------------------------------------------------
// PORTED BACKEND REST CONTROLLER APIS
// ----------------------------------------------------

// 1. GET: /api/users/getUserTypes/
app.get("/api/users/getUserTypes/", (req: Request, res: Response) => {
  logRequest(req, userTypes);
  res.json(userTypes);
});

// 2. POST: /api/users/registerUser/
app.post("/api/users/registerUser/", (req: Request, res: Response) => {
  const { userEmail, password, userTypeId, firstName, lastName, contactNo } = req.body;

  // Basic validation
  if (!userEmail || !password || !userTypeId || !firstName || !lastName || !contactNo) {
    const err = { error: "registration fields cannot be null" };
    logRequest(req, err);
    return res.status(400).json(err);
  }

  // Check email exists
  const exists = users.some(u => u.userEmail.toLowerCase() === userEmail.toLowerCase());
  if (exists) {
    const err = { error: "userEmailAlreadyExists" };
    logRequest(req, err);
    return res.status(400).json(err);
  }

  // Insert user
  const newUser: User = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    userEmail,
    password,
    userTypeId: Number(userTypeId),
    firstName,
    lastName,
    contactNo,
    isActive: 1,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString()
  };

  users.push(newUser);

  const succ = { message: "User is registered.", id: newUser.id };
  logRequest(req, succ);
  res.json(succ);
});

// 3. POST: /api/users/validateUser/
app.post("/api/users/validateUser/", (req: Request, res: Response) => {
  const { userEmail, password } = req.body;
  const user = users.find(u => u.userEmail.toLowerCase() === (userEmail || "").toLowerCase());

  const isValid = user ? user.password === password : false;
  if (isValid && user) {
    user.lastLoginTime = new Date().toISOString();
  }

  logRequest(req, isValid);
  res.json(isValid);
});

// 4. POST: /api/users/userEmailAlreadyExists/
app.post("/api/users/userEmailAlreadyExists/", (req: Request, res: Response) => {
  const { userEmail } = req.body;
  const exists = users.some(u => u.userEmail.toLowerCase() === (userEmail || "").toLowerCase());
  logRequest(req, exists);
  res.json(exists);
});

// 5. POST: /api/users/resetPassword/
app.post("/api/users/resetPassword/", (req: Request, res: Response) => {
  const { userEmail, password } = req.body;
  const user = users.find(u => u.userEmail.toLowerCase() === (userEmail || "").toLowerCase());

  if (user) {
    user.password = password;
    user.modifiedOn = new Date().toISOString();
    logRequest(req, true);
    return res.json(true);
  }

  logRequest(req, false);
  res.json(false);
});

// 6. GET: /api/users/testHello/
app.get("/api/users/testHello/", (req: Request, res: Response) => {
  const responseText = "Hello";
  logRequest(req, responseText);
  res.send(responseText);
});

// ----------------------------------------------------
// ADDITIONAL HELPERS FOR FULL-STACK INTEGRATION
// ----------------------------------------------------

// Active Logs explorer
app.get("/api/logs", (req: Request, res: Response) => {
  res.json(apiLogs);
});

// Reset sandbox database
app.post("/api/admin/reset", (req: Request, res: Response) => {
  resetDatabase();
  const resMsg = { message: "Database re-seeded successfully." };
  logRequest(req, resMsg);
  res.json(resMsg);
});

// GET users
app.get("/api/admin/users", (req: Request, res: Response) => {
  res.json(users.map(({ password, ...u }) => u));
});

// Single sign in mapping back the full user object
app.post("/api/users/getCurrentUser", (req: Request, res: Response) => {
  const { userEmail } = req.body;
  const user = users.find(u => u.userEmail.toLowerCase() === (userEmail || "").toLowerCase());
  if (user) {
    const { password, ...safeUser } = user;
    return res.json(safeUser);
  }
  res.status(404).json({ error: "User not found" });
});

// Open Jobs API
app.get("/api/jobs", (req: Request, res: Response) => {
  res.json(jobs);
});

app.post("/api/jobs", (req: Request, res: Response) => {
  const { title, companyName, location, salary, description, skills } = req.body;
  const newJob: Job = {
    id: jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1,
    title,
    companyName,
    location,
    salary,
    description,
    skills: skills || [],
    createdOn: new Date().toISOString()
  };
  jobs.push(newJob);
  logRequest(req, newJob);
  res.json(newJob);
});

// Applications API
app.get("/api/applications", (req: Request, res: Response) => {
  res.json(applications);
});

app.post("/api/applications/apply", (req: Request, res: Response) => {
  const { jobId, candidateId, coverLetter, experience } = req.body;
  const job = jobs.find(j => j.id === Number(jobId));
  const user = users.find(u => u.id === Number(candidateId));

  if (!job || !user) {
    return res.status(404).json({ error: "Job or candidate not found in database." });
  }

  // Prevent multiple applications to same job
  const alreadyApplied = applications.some(a => a.jobId === Number(jobId) && a.candidateId === Number(candidateId));
  if (alreadyApplied) {
    return res.status(400).json({ error: "You've already applied to this position." });
  }

  const newApp: Application = {
    id: applications.length > 0 ? Math.max(...applications.map(a => a.id)) + 1 : 1,
    jobId: job.id,
    jobTitle: job.title,
    companyName: job.companyName,
    candidateId: user.id,
    candidateName: `${user.firstName} ${user.lastName}`,
    candidateEmail: user.userEmail,
    status: "Applied",
    appliedOn: new Date().toISOString(),
    experience: experience || "",
    coverLetter: coverLetter || ""
  };

  applications.push(newApp);
  logRequest(req, newApp);
  res.json(newApp);
});

// Change application status
app.post("/api/applications/status", (req: Request, res: Response) => {
  const { applicationId, status } = req.body;
  const appItem = applications.find(a => a.id === Number(applicationId));
  if (appItem) {
    appItem.status = status;
    logRequest(req, appItem);
    return res.json(appItem);
  }
  res.status(404).json({ error: "Application not found" });
});

// Interviews API
app.get("/api/interviews", (req: Request, res: Response) => {
  res.json(interviews);
});

app.post("/api/interviews/schedule", (req: Request, res: Response) => {
  const { applicationId, interviewerId, dateTime } = req.body;
  const appItem = applications.find(a => a.id === Number(applicationId));
  const interviewer = users.find(u => u.id === Number(interviewerId) && u.userTypeId === 3);

  if (!appItem || !interviewer) {
    return res.status(404).json({ error: "Application or Interviewer not found." });
  }

  const newInterview: Interview = {
    id: interviews.length > 0 ? Math.max(...interviews.map(i => i.id)) + 1 : 1,
    applicationId: appItem.id,
    candidateName: appItem.candidateName,
    jobTitle: appItem.jobTitle,
    interviewerId: interviewer.id,
    interviewerName: `${interviewer.firstName} ${interviewer.lastName}`,
    dateTime,
    status: "Scheduled"
  };

  interviews.push(newInterview);
  appItem.status = "Interview Scheduled";

  logRequest(req, newInterview);
  res.json(newInterview);
});

app.post("/api/interviews/evaluate", (req: Request, res: Response) => {
  const { interviewId, technicalScore, softSkillsScore, cultureFitScore, notes } = req.body;
  const intItem = interviews.find(i => i.id === Number(interviewId));

  if (intItem) {
    intItem.status = "Completed";
    intItem.evaluation = {
      technicalScore: Number(technicalScore),
      softSkillsScore: Number(softSkillsScore),
      cultureFitScore: Number(cultureFitScore),
      notes,
      submittedOn: new Date().toISOString()
    };

    // Update corresponding application
    const appItem = applications.find(a => a.id === intItem.applicationId);
    if (appItem) {
      appItem.status = "Reviewed";
    }

    logRequest(req, intItem);
    return res.json(intItem);
  }
  res.status(404).json({ error: "Interview record not found." });
});

app.post("/api/interviews/update-status", (req: Request, res: Response) => {
  const { interviewId, status, dateTime } = req.body;
  const intItem = interviews.find(i => i.id === Number(interviewId));

  if (intItem) {
    if (status) {
      intItem.status = status;
      // sync application status if cancelled
      if (status === "Cancelled") {
        const appItem = applications.find(a => a.id === intItem.applicationId);
        if (appItem && appItem.status === "Interview Scheduled") {
          appItem.status = "Reviewed";
        }
      }
    }
    if (dateTime) {
      intItem.dateTime = dateTime;
    }
    logRequest(req, intItem);
    return res.json(intItem);
  }
  res.status(404).json({ error: "Interview record not found." });
});

// AI suggestions route using server-side Gemini API
app.post("/api/gemini/suggest", async (req: Request, res: Response) => {
  const { resumeText, jobDescription } = req.body;
  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: "Both resume text and job description are required." });
  }

  try {
    const aiClient = getAIClient();
    const prompt = `
      You are an expert HR Analyst. Please analyze the following Candidate Resume against the requested Job Description.
      Provide:
      1. A numeric Matching Score from 0 to 100 based on skill fit.
      2. 3 highly constructive bullet points for resume improvement.
      3. What key target technologies or keywords are missing from the resume.

      FORMAT YOUR RESPONSE IN PURE JSON matching this exact typescript interface:
      {
        "matchingScore": number,
        "improvements": string[],
        "missingKeywords": string[]
      }

      Do not wrap it in markdown. Return ONLY the valid JSON object.

      JOB DESCRIPTION:
      ${jobDescription}

      CANDIDATE RESUME:
      ${resumeText}
    `;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "{}";
    const resultJson = JSON.parse(responseText.trim());
    logRequest(req, resultJson);
    res.json(resultJson);

  } catch (error: any) {
    console.error("Gemini suggestion error:", error);
    // Graceful fallback if no API key or some other error occurs
    const mockAnalysis = {
      matchingScore: 78,
      improvements: [
        "Include concrete metrics for your software contributions (e.g., 'improved performance by 25%').",
        "Emphasize experience with modern declarative styles and micro-service Express architectures.",
        "Highlight collaborative work with Interviewers and Recruiting teams."
      ],
      missingKeywords: ["TypeScript", "Rest API Security", "Docker"],
      isMock: true,
      errorInfo: error.message
    };
    logRequest(req, mockAnalysis);
    res.json(mockAnalysis);
  }
});

// AI PDF resume parsing route
app.post("/api/gemini/parse-pdf", async (req: Request, res: Response) => {
  const { fileBase64, fileName } = req.body;
  if (!fileBase64) {
    return res.status(400).json({ error: "No PDF file provided." });
  }

  try {
    const aiClient = getAIClient();
    const prompt = `
      You are an expert resume parsing tool. Please parse the attached PDF resume and return the following details:
      1. Complete plain text extraction of the resume (cleaned up, formatted nicely).
      2. Structured information:
         - candidateName: Full name of the candidate
         - email: Email address if found
         - phone: Phone number if found
         - coreSkills: Array of top 5-10 technical skills found
         - experienceSummary: A brief paragraph of their professional experience
         - estimatedYearsOfExperience: number representing years of experience

      FORMAT YOUR RESPONSE AS VALID PURE JSON matching this exact interface:
      {
        "extractedText": string,
        "candidateName": string,
        "email": string,
        "phone": string,
        "coreSkills": string[],
        "experienceSummary": string,
        "estimatedYearsOfExperience": number
      }

      Do not wrap the JSON output in markdown blocks or any other characters. Return ONLY the JSON object.
    `;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: fileBase64,
            mimeType: "application/pdf"
          }
        },
        prompt
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "{}";
    const resultJson = JSON.parse(responseText.trim());
    logRequest(req, resultJson);
    return res.json(resultJson);

  } catch (error: any) {
    console.error("PDF Parsing error, using graceful mock fallback:", error);
    
    // Create a realistic fallback mock based on file name or simple heuristics
    const candidateName = fileName ? fileName.replace(/\.[^/.]+$/, "").split(/[_\s-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Alex Candidate";
    
    const mockParsing = {
      extractedText: `RESUME SUMMARY - ${candidateName.toUpperCase()}\n\nCONTACT INFORMATION\nEmail: candidate@demo.com\nPhone: (555) 019-2834\n\nPROFESSIONAL SUMMARY\nHighly competent Software Engineer with expertise in building scalable web applications and enterprise services.\n\nEXPERIENCE\n- Senior Software Engineer (3+ Years)\n  Built fullstack modules, streamlined database indices, and optimized REST client calls.\n- Software Developer Associate\n  Authored automated unit tests, optimized styling frameworks and accelerated build outputs.\n\nSKILLS\nReact, TypeScript, Node.js/Express, Tailwind CSS, SQL, Git, RESTful Web Services`,
      candidateName: candidateName,
      email: "candidate@demo.com",
      phone: "(555) 019-2834",
      coreSkills: ["React", "TypeScript", "Node.js", "Express", "Tailwind CSS", "SQL"],
      experienceSummary: "3+ years of professional fullstack engineering with React and Express, specializing in design patterns and automated pipelines.",
      estimatedYearsOfExperience: 3,
      isMock: true,
      errorInfo: error.message
    };
    
    logRequest(req, mockParsing);
    return res.json(mockParsing);
  }
});

// ----------------------------------------------------
// VITE AND STATIC SERVING MAIN LOGIC
// ----------------------------------------------------

async function startServer() {
  if (process.env.VERCEL) {
    // Vercel serverless environment does not need to start a listener.
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched and listening on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
