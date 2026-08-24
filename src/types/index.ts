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
  appliedAt?: string;
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
