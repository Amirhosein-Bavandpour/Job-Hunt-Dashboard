import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readData } from '@/lib/server/store';
import { verifyToken, getCookie } from '@/lib/server/auth';
import { summarizeCompanies } from '@/lib/aggregate';

// GET /api/companies — applications aggregated by employer into
// CompanySummary objects (name, positions, statuses, best salary, ...),
// ranked with offers/interviews first. Same shape the UI expects (the UI
// aggregates client-side so it can include localStorage-only demo edits; this
// route serves the shared data as-is).
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
  return NextResponse.json({ companies: summarizeCompanies(store.apps) });
}
