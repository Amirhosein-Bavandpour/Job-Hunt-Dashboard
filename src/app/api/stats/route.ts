import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readData } from '@/lib/server/store';
import { verifyToken, getCookie } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  const token = getCookie(req, 'jhd_auth');
  if (token) {
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
  }

  // Demo-mode fallback: on the live deploy the file store is read-only and the
  // /api/auth/me endpoint returns a demo user without a JWT cookie. The data
  // routes serve the shared application data either way — no per-user isolation
  // in this file-store version, so no auth gate is needed for reads.

  const store = readData();
  const apps = store.apps as {
    status: string;
    salary: number | null;
    appliedAt?: string;
  }[];

  const statusCounts: Record<string, number> = {};
  apps.forEach((a: { status: string }) => {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
  });

  // Applications over time (by appliedAt date)
  const byDate: Record<string, number> = {};
  apps.forEach((a: { appliedAt?: string }) => {
    const d = a.appliedAt ? a.appliedAt.slice(0, 10) : 'unknown';
    byDate[d] = (byDate[d] ?? 0) + 1;
  });
  const trend = Object.entries(byDate)
    .sort(([a]: [string, number], [b]: [string, number]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Per-status counts per month (by appliedAt month) — drives the
  // stacked status-trend bar on the Analytics page.
  const trendMap = new Map<string, { applied: number; interview: number; offer: number; rejected: number }>();
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
    .filter((a: { salary: number | null }) => a.salary != null)
    .map((a: { salary: number | null }) => a.salary as number);
  const avgSalary = salaries.length
    ? Math.round(salaries.reduce((s: number, x: number) => s + x, 0) / salaries.length)
    : 0;

  return NextResponse.json({
    total,
    statusCounts,
    trend,
    statusTrend,
    thisMonth,
    avgSalary,
  });
}
