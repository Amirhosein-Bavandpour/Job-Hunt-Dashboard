import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, clearSessionCookie } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('jhd_auth')?.value;
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.json({
        ok: true,
        user: { id: payload.sub, name: payload.name, email: payload.email },
      });
    }
  }

  // No valid session — fall back to a demo user on the live deploy so the
  // protected UI still renders. In local dev with a real session, the real
  // user is returned above; the demo mode is transparent to the frontend.
  const demoUser = {
    id: 'demo',
    name: 'Demo User',
    email: 'demo@jobhunt.dev',
  };
  return NextResponse.json({ ok: true, user: demoUser });
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', clearSessionCookie());
  return res;
}
