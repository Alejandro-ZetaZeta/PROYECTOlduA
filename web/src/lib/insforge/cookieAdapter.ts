import type { AstroCookies } from 'astro';
import type { CookieOptions, CookieStore, CookieWriter } from '@insforge/sdk/ssr';

/**
 * Adapts Astro's unified `AstroCookies` to the SDK's `CookieStore` shape.
 *
 * The SDK distinguishes read (request) from write (response) stores because
 * Next.js exposes them separately. Astro doesn't, so the same store is used
 * for both — writes here will be flushed by Astro at the end of the request.
 */
export function toCookieStore(cookies: AstroCookies): CookieStore {
  const get: CookieStore['get'] = (name) => {
    const c = cookies.get(name);
    return c ? c.value : undefined;
  };

  // Match the SDK's overloaded signatures for set/delete.
  const set = ((...args: unknown[]) => {
    if (typeof args[0] === 'string') {
      const [name, value, options] = args as [string, string, CookieOptions?];
      cookies.set(name, value, toAstroSetOptions(options));
    } else {
      const opts = args[0] as { name: string; value: string } & CookieOptions;
      const { name, value, ...rest } = opts;
      cookies.set(name, value, toAstroSetOptions(rest));
    }
  }) as CookieWriter['set'];

  const del = ((...args: unknown[]) => {
    if (typeof args[0] === 'string') {
      cookies.delete(args[0]);
    } else {
      const { name, ...rest } = args[0] as { name: string } & CookieOptions;
      cookies.delete(name, rest as Parameters<AstroCookies['delete']>[1]);
    }
  }) as CookieWriter['delete'];

  return { get, set, delete: del };
}

function toAstroSetOptions(options?: CookieOptions) {
  if (!options) return undefined;
  const out: {
    domain?: string;
    path?: string;
    expires?: Date;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
  } = {};
  if (options.domain !== undefined) out.domain = options.domain;
  if (options.path !== undefined) out.path = options.path;
  if (options.expires !== undefined) out.expires = options.expires;
  if (options.maxAge !== undefined) out.maxAge = options.maxAge;
  if (options.httpOnly !== undefined) out.httpOnly = options.httpOnly;
  if (options.secure !== undefined) out.secure = options.secure;
  if (options.sameSite !== undefined) out.sameSite = options.sameSite;
  return out;
}
