import { createBrowserClient } from '@insforge/sdk/ssr';

const BASE_URL = import.meta.env.PUBLIC_INSFORGE_URL;
const ANON_KEY = import.meta.env.PUBLIC_INSFORGE_ANON_KEY;

const REFRESH_PATH = '/api/auth/refresh';

/**
 * SDK bug workaround: `createBrowserClient`'s internal `ssrFetch` calls
 * `fetchImpl(input, init)` with the ABSOLUTE backend URL when the request
 * targets the refresh endpoint (because the SDK's http layer always
 * prepends `baseUrl`). That bypasses our app's `/api/auth/refresh`
 * route — the browser hits the InsForge backend directly, which has no
 * refresh-token cookie (we set it on our origin), and the call returns
 * 401, killing the session.
 *
 * Intercepts `fetch` so any request to `${baseUrl}/api/auth/refresh`
 * (or anything ending in `/api/auth/refresh`) is rewritten to the
 * relative path, which the browser resolves against our app's origin.
 */
const baseFetch = globalThis.fetch?.bind(globalThis);
const fetchWithRefreshRewrite: typeof globalThis.fetch = (input, init) => {
  if (!baseFetch) throw new Error('Fetch is not available');
  const target =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  if (target.endsWith(REFRESH_PATH)) {
    return baseFetch(REFRESH_PATH, init);
  }
  return baseFetch(input as RequestInfo, init);
};

/**
 * Browser-side InsForge client.
 *
 * Reads `insforge_access_token` (set as a non-httpOnly cookie by the server)
 * to authenticate SDK calls. When the token is missing, expired, or rejected
 * as auth-expired, it refreshes through the app's `/api/auth/refresh` route
 * using the httpOnly `insforge_refresh_token` cookie.
 *
 * Auth surface is read-only here: signIn / signOut / OAuth go through the
 * server endpoints under `/api/auth/*`.
 */
export const insforge = createBrowserClient({
  baseUrl: BASE_URL,
  anonKey: ANON_KEY,
  refreshUrl: REFRESH_PATH,
  fetch: fetchWithRefreshRewrite,
});
