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
  return NextResponse.json({ companies: store.companies });
}
