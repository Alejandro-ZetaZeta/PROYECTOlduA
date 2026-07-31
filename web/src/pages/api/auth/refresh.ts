import type { APIRoute } from 'astro';
import { refreshAuth } from '@insforge/sdk/ssr';
import { toCookieStore } from '../../../lib/insforge/cookieAdapter';

const BASE_URL = import.meta.env.PUBLIC_INSFORGE_URL;
const ANON_KEY = import.meta.env.PUBLIC_INSFORGE_ANON_KEY;

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const result = await refreshAuth({
    request,
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    cookies: toCookieStore(cookies),
  });
  return result.response;
};
