import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'job-hunt-demo-secret-change-in-prod'
);

export interface JWTPayloadExt {
  sub: string;
  email: string;
  name: string;
}

export async function signToken(payload: JWTPayloadExt): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayloadExt | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayloadExt;
  } catch {
    return null;
  }
}

export function getCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

export const COOKIE_NAME = 'jhd_auth';

// Build a Set-Cookie header value for the session cookie.
export function sessionCookieValue(token: string): string {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const secure = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; ${secure ? 'Secure' : ''}; SameSite=Lax`;
}

// Build a Set-Cookie header value that clears the session cookie.
export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; ${secure ? 'Secure' : ''}; SameSite=Lax`;
}
