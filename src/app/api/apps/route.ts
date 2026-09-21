import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readData, writeData } from '@/lib/server/store';
import {
  verifyToken,
  getCookie,
  sessionCookieValue,
} from '@/lib/server/auth';

function requireAuth(req: NextRequest): Promise<{ userId: string; email: string } | Response> {
  const token = getCookie(req, 'jhd_auth');
  if (token) {
    return verifyToken(token).then((payload) => {
      if (!payload) {
        return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
      }
      return { userId: payload.sub, email: payload.email };
    });
  }
  // Demo-mode fallback: serve the shared data without a JWT cookie.
  // The file-store version has no per-user isolation, so reads are unguarded
  // in demo mode on the live deploy.
  return Promise.resolve({ userId: 'demo', email: 'demo@jobhunt.dev' });
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const store = readData();
  const apps = store.apps;
  const companies = store.companies;

  return NextResponse.json({
    applications: apps,
    companies,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const app = {
    id: `a_${Date.now()}`,
    company: String(body.company ?? ''),
    position: String(body.position ?? ''),
    status: String(body.status ?? 'saved'),
    salary: body.salary != null ? Number(body.salary) : null,
    location: String(body.location ?? ''),
    workMode: String(body.workMode ?? 'remote'),
    jobUrl: body.jobUrl ? String(body.jobUrl) : undefined,
    notes: body.notes ? String(body.notes) : undefined,
    interviewNotes: body.interviewNotes ? String(body.interviewNotes) : undefined,
    appliedAt: body.appliedAt ? String(body.appliedAt) : undefined,
    createdAt: new Date().toISOString(),
  };

  if (!app.company || !app.position) {
    return NextResponse.json({ error: 'company and position are required' }, { status: 400 });
  }

  const store = readData();
  try {
    store.apps.push(app);
    writeData(store);
  } catch {
    // Read-only filesystem (demo mode on live deploy) — can't persist.
    return NextResponse.json(
      { error: 'Demo mode: changes are not persisted on the live deploy.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, app }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const store = readData();
  const idx = store.apps.findIndex((a: { id: string }) => a.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const existing = store.apps[idx];
  const updated = {
    ...existing,
    company: body.company != null ? String(body.company) : existing.company,
    position: body.position != null ? String(body.position) : existing.position,
    status: body.status != null ? String(body.status) : existing.status,
    salary: body.salary != null ? Number(body.salary) : existing.salary,
    location: body.location != null ? String(body.location) : existing.location,
    workMode: body.workMode != null ? String(body.workMode) : existing.workMode,
    jobUrl: body.jobUrl != null ? (body.jobUrl === '' ? undefined : String(body.jobUrl)) : existing.jobUrl,
    notes: body.notes != null ? (body.notes === '' ? undefined : String(body.notes)) : existing.notes,
    interviewNotes: body.interviewNotes != null ? (body.interviewNotes === '' ? undefined : String(body.interviewNotes)) : existing.interviewNotes,
    appliedAt: body.appliedAt != null ? (body.appliedAt === '' ? undefined : String(body.appliedAt)) : existing.appliedAt,
  };
  try {
    store.apps[idx] = updated;
    writeData(store);
  } catch {
    return NextResponse.json(
      { error: 'Demo mode: changes are not persisted on the live deploy.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, app: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  // Accept id from query param (DELETE bodies aren't reliably parsed by
  // Next.js route handlers in all clients — query param is bulletproof).
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
  }

  const store = readData();
  const idx = store.apps.findIndex((a: { id: string }) => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  try {
    store.apps.splice(idx, 1);
    writeData(store);
  } catch {
    return NextResponse.json(
      { error: 'Demo mode: changes are not persisted on the live deploy.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
