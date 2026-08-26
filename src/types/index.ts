// Shared domain models -> TypeScript used everywhere (components, RTK Query, Redux, Zustand).
export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  salary?: number;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  jobUrl?: string;
  notes?: string;
  interviewNotes?: string; // prep notes for the interview (questions, research, talking points)
  appliedAt?: string;
  interviewDate?: string; // YYYY-MM-DD — drives the Calendar view
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  interviews: number;
  offers: number;
  rejected: number;
  thisMonth: number;
  upcoming: number;
}

// ---- Phase 5 domain models ----

// Analytics aggregated from the mock applications.
export interface AnalyticsData {
  // Count per application status (saved/applied/screening/interview/offer/rejected)
  byStatus: { status: ApplicationStatus; count: number }[];
  // Applications created per month, e.g. { month: '2026-06', count: 3 }
  byMonth: { month: string; count: number }[];
  // Status breakdown over time (for a stacked area/bar) keyed by month
  trend: { month: string; applied: number; interview: number; offer: number; rejected: number }[];
}

// Calendar event derived from an application with an interview date.
export interface CalendarEvent {
  id: string;
  applicationId: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  date: string; // ISO date (YYYY-MM-DD)
}

export type ThemeMode = 'dark' | 'light';

// Aggregated company view derived from applications.
export interface CompanySummary {
  name: string;
  applications: number;
  positions: string[];
  statuses: ApplicationStatus[];
  latestStatus: ApplicationStatus;
  workModes: ('remote' | 'hybrid' | 'onsite')[];
  locations: string[];
  bestSalary: number;
  hasOffer: boolean;
  hasInterview: boolean;
}
