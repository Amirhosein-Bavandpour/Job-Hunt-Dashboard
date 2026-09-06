import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readData } from '@/lib/server/store';
import { verifyToken, getCookie } from '@/lib/server/auth';

// GET /api/apps/:id — single application (used by getApplication query).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getCookie(req, 'jhd_auth');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  const { id } = await params;
  const store = readData();
  const app = store.apps.find((a: { id: string }) => a.id === id);
  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }
  return NextResponse.json(app);
}
