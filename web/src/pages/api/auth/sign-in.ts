import type { APIRoute } from 'astro';
import { createAuthActions } from '@insforge/sdk/ssr';
import { toCookieStore } from '../../../lib/insforge/cookieAdapter';

const BASE_URL = import.meta.env.PUBLIC_INSFORGE_URL;
const ANON_KEY = import.meta.env.PUBLIC_INSFORGE_ANON_KEY;

export const prerender = false;

// --- Input hardening -------------------------------------------------------
// Reject control characters and enforce sane lengths before they reach the
// auth provider. Prevents header/CRLF injection and oversized payloads.

const EMAIL_MAX = 254;
const PASSWORD_MAX = 128;
const CONTROL_RE = /[\r\n\0]/;

function isSafeEmail(email: string): boolean {
  return (
    email.length > 0 &&
    email.length <= EMAIL_MAX &&
    !CONTROL_RE.test(email) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function isSafePassword(password: string): boolean {
  return password.length > 0 && password.length <= PASSWORD_MAX && !CONTROL_RE.test(password);
}

// --- Brute-force guard (in-memory, per email+IP) --------------------------
// Simple lockout so an attacker can't hammer the endpoint. Not durable across
// restarts — acceptable for a single-tenant admin panel; keep generic errors
// regardless so we never leak whether an account exists.

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const FAILURE_DELAY_MS = 600;

interface Attempt {
  count: number;
  lockedUntil: number;
}

const attempts = new Map<string, Attempt>();

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function attemptKey(ip: string, email: string): string {
  return `${ip}:${email.toLowerCase()}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    email = typeof body.email === 'string' ? body.email : undefined;
    password = typeof body.password === 'string' ? body.password : undefined;
  } catch {
    return json({ error: 'invalid_body', message: 'JSON body required.' }, 400);
  }
  if (!email || !password || !isSafeEmail(email) || !isSafePassword(password)) {
    // Swallow malformed credentials behind the same generic failure message.
    await delay(FAILURE_DELAY_MS);
    return json({ error: 'invalid_credentials', message: 'Credenciales incorrectas.' }, 401);
  }

  // Lockout check before touching the auth provider.
  const ip = clientIp(request);
  const key = attemptKey(ip, email);
  const now = Date.now();
  const record = attempts.get(key);
  if (record && record.lockedUntil > now) {
    return json({ error: 'too_many_attempts', message: 'Demasiados intentos. Intenta más tarde.' }, 429);
  }
  if (record && record.lockedUntil <= now) attempts.delete(key);

  function recordFailure() {
    const cur = attempts.get(key);
    const count = (cur?.count ?? 0) + 1;
    attempts.set(key, count >= MAX_ATTEMPTS ? { count, lockedUntil: Date.now() + LOCKOUT_MS } : { count, lockedUntil: 0 });
  }

  const store = toCookieStore(cookies);
  const auth = createAuthActions({ baseUrl: BASE_URL, anonKey: ANON_KEY, cookies: store });

  const { data, error } = await auth.signInWithPassword({ email, password });
  if (error || !data?.user) {
    recordFailure();
    await delay(FAILURE_DELAY_MS);
    return json({ error: 'invalid_credentials', message: 'Credenciales incorrectas.' }, 401);
  }

  // Role check on the just-issued session. The server client reads the
  // access-token cookie that signInWithPassword just set on `cookies`.
  const { createServerClient } = await import('@insforge/sdk/ssr');
  const server = createServerClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    cookies: store,
  });
  const { data: profile, error: profileError } = await server.database
    .from('profiles')
    .select('role')
    .eq('auth_id', data.user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    await auth.signOut();
    recordFailure();
    await delay(FAILURE_DELAY_MS);
    return json(
      { error: 'forbidden', message: 'Tu cuenta no tiene permisos de administrador.' },
      403,
    );
  }

  attempts.delete(key);
  return json({ user: { id: data.user.id, email: data.user.email }, role: profile.role }, 200);
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
