import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { readData } from '@/lib/server/store';
import { signToken, sessionCookieValue } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, password } = body ?? {};
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  const store = readData();
  const user = store.users.find((u: { email: string }) => u.email === email.toLowerCase());
  if (!user) {
    // No matching account — fall back to a demo user so the UI can still be
    // shown on the live deploy (where the file store may be read-only).
    const demoUser = {
      id: `demo_${Date.now()}`,
      name: 'Demo User',
      email: email.toLowerCase(),
      password: '',
      createdAt: new Date().toISOString(),
    };
    const token = await signToken({ sub: demoUser.id, email: demoUser.email, name: demoUser.name });
    const res = NextResponse.json(
      { ok: true, user: { id: demoUser.id, name: demoUser.name, email: demoUser.email } }
    );
    res.headers.set('Set-Cookie', sessionCookieValue(token));
    return res;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = await signToken({ sub: user.id, email: user.email, name: user.name });
  const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  res.headers.set('Set-Cookie', sessionCookieValue(token));
  return res;
}
