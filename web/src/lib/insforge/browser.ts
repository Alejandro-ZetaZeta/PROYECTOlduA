import { createBrowserClient } from '@insforge/sdk/ssr';

const REFRESH_PATH = '/api/auth/refresh';

/**
 * InsForge config resolution. We try, in order:
 *  1. `window.__INSFORGE_CONFIG__` — server-injected by BaseLayout at request
 *     time, so it works regardless of whether `PUBLIC_INSFORGE_*` was set
 *     when the client bundle was built.
 *  2. `import.meta.env.PUBLIC_INSFORGE_URL` / `_ANON_KEY` — the Astro-native
 *     way, inlined at build time. Useful for local dev and edge cases where
 *     BaseLayout didn't run (e.g. Storybook, tests).
 *
 * The SDK's own env-var fallback (`NEXT_PUBLIC_INSFORGE_*`) is a Next.js
 * convention and never fires in the browser, so we don't rely on it.
 */
function resolveConfig(): { baseUrl: string; anonKey: string } | null {
  const fromWindow =
    typeof window !== 'undefined'
      ? (window as unknown as { __INSFORGE_CONFIG__?: { baseUrl?: string; anonKey?: string } })
          .__INSFORGE_CONFIG__
      : undefined;
  if (fromWindow?.baseUrl && fromWindow?.anonKey) {
    return { baseUrl: fromWindow.baseUrl, anonKey: fromWindow.anonKey };
  }
  const baseUrl = import.meta.env.PUBLIC_INSFORGE_URL;
  const anonKey = import.meta.env.PUBLIC_INSFORGE_ANON_KEY;
  if (baseUrl && anonKey) return { baseUrl, anonKey };
  return null;
}

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

const config = resolveConfig();
if (!config) {
  // Defer the throw to first SDK use so a misconfigured build doesn't take
  // down unrelated pages (Hero, CTA, etc.) on /registro-torneo.
  console.warn(
    '[insforge/browser] Missing config — set PUBLIC_INSFORGE_URL and PUBLIC_INSFORGE_ANON_KEY in the deployment environment.',
  );
}

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
  baseUrl: config?.baseUrl ?? '',
  anonKey: config?.anonKey ?? '',
  refreshUrl: REFRESH_PATH,
  fetch: fetchWithRefreshRewrite,
});
