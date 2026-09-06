import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clearSessionCookie } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  // Clear the httpOnly session cookie. Always succeeds (harmless if no session).
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', clearSessionCookie());
  return res;
}
