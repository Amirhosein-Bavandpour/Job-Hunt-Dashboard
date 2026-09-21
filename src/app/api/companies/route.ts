import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readData } from '@/lib/server/store';
import { verifyToken, getCookie } from '@/lib/server/auth';

// GET /api/companies — applications aggregated by employer into
// CompanySummary objects (name, positions, statuses, best salary, ...),
// ranked with offers/interviews first. Same shape the UI expects.
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
    company: string;
    position: string;
    status: string;
    salary: number | null;
    location: string;
    workMode: string;
  }[];

  const map = new Map<string, typeof apps>();
  for (const a of apps) {
    if (!map.has(a.company)) map.set(a.company, []);
    map.get(a.company)!.push(a);
  }

  const summaries = [...map.entries()].map(([name, list]) => ({
    name,
    applications: list.length,
    positions: [...new Set(list.map((a) => a.position))],
    statuses: list.map((a) => a.status),
    latestStatus: list[0]?.status ?? 'saved',
    workModes: [...new Set(list.map((a) => a.workMode))],
    locations: [...new Set(list.map((a) => a.location).filter(Boolean))],
    bestSalary: list.reduce((m, a) => Math.max(m, a.salary ?? 0), 0),
    hasOffer: list.some((a) => a.status === 'offer'),
    hasInterview: list.some((a) => a.status === 'interview'),
  }));

  summaries.sort((a, b) => {
    if (a.hasOffer !== b.hasOffer) return a.hasOffer ? -1 : 1;
    if (a.hasInterview !== b.hasInterview) return a.hasInterview ? -1 : 1;
    return b.applications - a.applications;
  });

  return NextResponse.json({ companies: summaries });
}
