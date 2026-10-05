import type { ApplicationStatus, CompanySummary } from '@/types';

// Aggregations behind /api/stats and /api/companies.
//
// They live here rather than inside the route handlers because the client runs the
// exact same functions over the *merged* list (server data + the localStorage edits
// that the read-only demo deploy can't persist). One implementation => the dashboard
// numbers can't drift from the API's.

export interface AggregatableApp {
  company: string;
  position: string;
  status: string;
  salary?: number | null;
  location?: string;
  workMode?: string;
  appliedAt?: string;
}

export interface AppStats {
  total: number;
  statusCounts: Record<string, number>;
  trend: { date: string; count: number }[];
  statusTrend: {
    month: string;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  }[];
  thisMonth: number;
  avgSalary: number;
}

export function computeStats(apps: AggregatableApp[]): AppStats {
  const statusCounts: Record<string, number> = {};
  apps.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
  });

  // Applications over time (by appliedAt date)
  const byDate: Record<string, number> = {};
  apps.forEach((a) => {
    const d = a.appliedAt ? a.appliedAt.slice(0, 10) : 'unknown';
    byDate[d] = (byDate[d] ?? 0) + 1;
  });
  const trend = Object.entries(byDate)
    .sort(([a]: [string, number], [b]: [string, number]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Per-status counts per month (by appliedAt month) — drives the stacked
  // status-trend bar on the Analytics page.
  const trendMap = new Map<
    string,
    { applied: number; interview: number; offer: number; rejected: number }
  >();
  for (const a of apps) {
    const m = (a.appliedAt ?? '').slice(0, 7);
    if (!m) continue;
    if (!trendMap.has(m)) trendMap.set(m, { applied: 0, interview: 0, offer: 0, rejected: 0 });
    const t = trendMap.get(m)!;
    if (a.status === 'applied') t.applied++;
    else if (a.status === 'interview') t.interview++;
    else if (a.status === 'offer') t.offer++;
    else if (a.status === 'rejected') t.rejected++;
  }
  const statusTrend = [...trendMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }));

  // "This month" follows the real calendar, not a hardcoded string.
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = apps.filter((a) => (a.appliedAt ?? '').startsWith(thisMonthKey)).length;

  const total = apps.length;
  const salaries = apps
    .filter((a) => a.salary != null)
    .map((a) => a.salary as number);
  const avgSalary = salaries.length
    ? Math.round(salaries.reduce((s: number, x: number) => s + x, 0) / salaries.length)
    : 0;

  return { total, statusCounts, trend, statusTrend, thisMonth, avgSalary };
}

// Applications aggregated by employer into CompanySummary objects, ranked with
// offers/interviews first. Same shape the UI expects.
export function summarizeCompanies(apps: AggregatableApp[]): CompanySummary[] {
  const map = new Map<string, AggregatableApp[]>();
  for (const a of apps) {
    if (!map.has(a.company)) map.set(a.company, []);
    map.get(a.company)!.push(a);
  }

  const summaries = [...map.entries()].map(([name, list]) => ({
    name,
    applications: list.length,
    positions: [...new Set(list.map((a) => a.position))],
    statuses: list.map((a) => a.status as ApplicationStatus),
    latestStatus: (list[0]?.status ?? 'saved') as ApplicationStatus,
    workModes: [...new Set(list.map((a) => a.workMode))] as CompanySummary['workModes'],
    locations: [...new Set(list.map((a) => a.location ?? '').filter(Boolean))],
    bestSalary: list.reduce((m, a) => Math.max(m, a.salary ?? 0), 0),
    hasOffer: list.some((a) => a.status === 'offer'),
    hasInterview: list.some((a) => a.status === 'interview'),
  }));

  summaries.sort((a, b) => {
    if (a.hasOffer !== b.hasOffer) return a.hasOffer ? -1 : 1;
    if (a.hasInterview !== b.hasInterview) return a.hasInterview ? -1 : 1;
    return b.applications - a.applications;
  });

  return summaries;
}
