import { defineMiddleware } from 'astro:middleware';
import { createServerClient, getAccessTokenCookieName } from '@insforge/sdk/ssr';
import { updateSession } from '@insforge/sdk/ssr/middleware';
import { toCookieStore } from './lib/insforge/cookieAdapter';

const BASE_URL = import.meta.env.PUBLIC_INSFORGE_URL;
const ANON_KEY = import.meta.env.PUBLIC_INSFORGE_ANON_KEY;

// Only /admin/* is server-gated. /registro-torneo and /tournament-registration
// are public — anyone can view the form and bracket. Admin features inside the
// page handle their own auth (the React island calls /api/auth/sign-in then
// checks the session cookie via createBrowserClient).
const ADMIN_PREFIXES = ['/admin'];

/**
 * Per-request middleware:
 *  1. Refresh InsForge session cookies (`insforge_access_token` /
 *     `insforge_refresh_token`) on every page + API request so the rest of
 *     the app always sees a fresh access token.
 *  2. Guard admin-only routes by verifying the access token + role on the
 *     `profiles` table. Non-admins (and unauthenticated users) get a 302
 *     back to the home page with a `?login=` flag the UI can pick up.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const store = toCookieStore(context.cookies);

  // 1. Refresh session cookies before any handler runs.
  await updateSession({
    requestCookies: store,
    responseCookies: store,
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
  });

  // 2. Admin guard (only for /admin/* routes).
  const path = context.url.pathname;
  if (!ADMIN_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return next();
  }

  const accessToken = context.cookies.get(getAccessTokenCookieName())?.value;
  if (!accessToken) {
    return context.redirect('/?login=required', 302);
  }

  const server = createServerClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    cookies: store,
    accessToken,
  });

  const { data: userData } = await server.auth.getCurrentUser();
  if (!userData?.user) {
    return context.redirect('/?login=required', 302);
  }

  const { data: profile } = await server.database
    .from('profiles')
    .select('role')
    .eq('auth_id', userData.user.id)
    .single();

  if (profile?.role !== 'admin') {
    return context.redirect('/?login=forbidden', 302);
  }

  return next();
});
