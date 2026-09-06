import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readData } from '@/lib/server/store';
import { verifyToken, getCookie } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  const token = getCookie(req, 'jhd_auth');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  const store = readData();
  const apps = store.apps;

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

  const total = apps.length;
  const salaries = apps.filter((a: { salary: number | null }) => a.salary != null).map((a: { salary: number | null }) => a.salary as number);
  const avgSalary = salaries.length ? Math.round(salaries.reduce((s: number, x: number) => s + x, 0) / salaries.length) : 0;

  return NextResponse.json({
    total,
    statusCounts,
    trend,
    avgSalary,
  });
}
