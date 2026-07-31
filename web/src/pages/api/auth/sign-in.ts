import type { APIRoute } from 'astro';
import { createAuthActions } from '@insforge/sdk/ssr';
import { toCookieStore } from '../../../lib/insforge/cookieAdapter';

const BASE_URL = import.meta.env.PUBLIC_INSFORGE_URL;
const ANON_KEY = import.meta.env.PUBLIC_INSFORGE_ANON_KEY;

export const prerender = false;

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
  if (!email || !password) {
    return json({ error: 'invalid_body', message: 'email and password are required.' }, 400);
  }

  const store = toCookieStore(cookies);
  const auth = createAuthActions({ baseUrl: BASE_URL, anonKey: ANON_KEY, cookies: store });

  const { data, error } = await auth.signInWithPassword({ email, password });
  if (error || !data?.user) {
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
    return json(
      { error: 'forbidden', message: 'Tu cuenta no tiene permisos de administrador.' },
      403,
    );
  }

  return json({ user: { id: data.user.id, email: data.user.email }, role: profile.role }, 200);
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
