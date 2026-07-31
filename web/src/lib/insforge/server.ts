import { createServerClient } from '@insforge/sdk/ssr';
import type { AstroCookies } from 'astro';
import { toCookieStore } from './cookieAdapter';

const BASE_URL = import.meta.env.PUBLIC_INSFORGE_URL;
const ANON_KEY = import.meta.env.PUBLIC_INSFORGE_ANON_KEY;

/**
 * Per-request server client. Reads `insforge_access_token` from the
 * request cookies and uses it as the per-request bearer token.
 */
export function createInsforgeServer(cookies: AstroCookies) {
  return createServerClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    cookies: toCookieStore(cookies),
  });
}
