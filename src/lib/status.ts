import type { ApplicationStatus } from '@/types';
import type { SxProps, Theme } from '@mui/material';

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

// Semantic status chip: outlined in the status colour, transparent fill.
// NOTE: deliberately NOT the theme's glowing cyan Chip — that override suits
// counts/actions, while statuses read better in their own colour.
export function statusChipSx(status: ApplicationStatus): SxProps<Theme> {
  const c = STATUS_COLORS[status];
  return {
    borderColor: c,
    color: c,
    background: 'transparent',
    fontWeight: 600,
  };
}
