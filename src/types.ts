export interface UserType {
  UserTypeId: number;
  UserTypeCode: "CAND" | "COMP" | "INTVR";
  UserTypeDesc: string;
}

export interface User {
  id: number;
  userEmail: string;
  password?: string;
  userTypeId: number;
  firstName: string;
  lastName: string;
  contactNo: string;
  isActive: number;
  createdOn: string;
  modifiedOn: string;
  lastLoginTime?: string;
}

export interface Job {
  id: number;
  title: string;
  companyName: string;
  location: string;
  salary: string;
  description: string;
  skills: string[];
  createdOn: string;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  status: "Applied" | "Reviewed" | "Interview Scheduled" | "Accepted" | "Rejected";
  appliedOn: string;
  experience?: string;
  coverLetter?: string;
}

export interface Interview {
  id: number;
  applicationId: number;
  candidateName: string;
  jobTitle: string;
  interviewerId: number;
  interviewerName: string;
  dateTime: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Delayed";
  evaluation?: {
    technicalScore: number;
    softSkillsScore: number;
    cultureFitScore: number;
    notes: string;
    submittedOn: string;
  };
}
