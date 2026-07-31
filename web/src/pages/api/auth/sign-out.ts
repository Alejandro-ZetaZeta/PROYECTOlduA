import type { APIRoute } from 'astro';
import { createAuthActions } from '@insforge/sdk/ssr';
import { toCookieStore } from '../../../lib/insforge/cookieAdapter';

const BASE_URL = import.meta.env.PUBLIC_INSFORGE_URL;
const ANON_KEY = import.meta.env.PUBLIC_INSFORGE_ANON_KEY;

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const auth = createAuthActions({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    cookies: toCookieStore(cookies),
  });
  await auth.signOut();
  return new Response(null, { status: 204 });
};
