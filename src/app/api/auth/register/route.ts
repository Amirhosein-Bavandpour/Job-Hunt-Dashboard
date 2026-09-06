import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { readData, writeData } from '@/lib/server/store';
import { signToken, sessionCookieValue } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, password } = body ?? {};
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const store = readData();
  if (store.users.find((u: { email: string }) => u.email === email)) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: `u_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password: hashed,
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  writeData(store);

  const token = await signToken({ sub: user.id, email: user.email, name: user.name });
  const res = NextResponse.json(
    { ok: true, user: { id: user.id, name: user.name, email: user.email } },
    { status: 201 }
  );
  res.headers.set('Set-Cookie', sessionCookieValue(token));
  return res;
}
