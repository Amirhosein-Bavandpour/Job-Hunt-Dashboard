import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readData, writeData } from '@/lib/server/store';
import {
  verifyToken,
  getCookie,
  sessionCookieValue,
  clearSessionCookie,
} from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  const token = getCookie(req, 'jhd_auth');
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    user: { id: payload.sub, name: payload.name, email: payload.email },
  });
}

export async function POST(req: NextRequest) {
  // Clear the httpOnly session cookie. Always succeeds (harmless if no session).
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', clearSessionCookie());
  return res;
}
