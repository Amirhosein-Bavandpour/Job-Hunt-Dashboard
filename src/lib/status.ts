import type { ApplicationStatus } from '@/types';

// Single source of truth for status colours + labels, shared across
// Dashboard, Applications, Analytics, Calendar, Companies.
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: '#64748b',
  applied: '#38bdf8',
  screening: '#818cf8',
  interview: '#22d3ee',
  offer: '#34d399',
  rejected: '#f87171',
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};
