// @ts-check
import { defineConfig, svgoOptimizer } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import { cacheVercel } from '@astrojs/vercel/cache';
import tailwindcss from '@tailwindcss/vite';

// `server` mode lets the middleware read/write cookies on every request and
// fixes the `Astro.request.headers` warning emitted on prerendered routes.
// Static marketing pages opt back into prerendering with `export const prerender = true`.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  // Astro 7 route caching: pushes cache directives to Vercel's edge network
  // instead of caching in-memory. Used by the `routeRules` below.
  cache: {
    provider: cacheVercel(),
  },
  // Page-load performance:
  //  - `defaultStrategy: 'hover'` prefetches internal pages on hover/focus
  //    (skipped on slow connections / data-saver mode automatically).
  //  - `ClientRouter` already enables prefetchAll=true by default for in-site links.
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
  // Per-route HTTP cache hints. Pushed to Vercel edge via cacheVercel().
  // - Static marketing pages: long max-age with SWR for fast repeat hits.
  // - /registro-torneo: short max-age (data is admin-driven, not fully static).
  // - /api/*: no cache (auth + DB writes).
  // Note: prerender is declared per-page via `export const prerender = true`,
  // not via routeRules (Astro 7's RouteRule type only accepts cache fields).
  routeRules: {
    '/': { maxAge: 300, swr: 600 },
    '/events/**': { maxAge: 300, swr: 600 },
    '/404': { maxAge: 3600, swr: 86400 },
    '/registro-torneo': { maxAge: 30, swr: 60 },
    '/tournament-registration': { maxAge: 30, swr: 60 },
    '/api/**': { maxAge: 0, swr: 0 },
  },
  redirects: {
    '/activate-uleam': '/',
    '/activate-uleam/registro-torneo': '/registro-torneo',
  },
  experimental: {
    // Auto-optimize every imported SVG component at build time with SVGO.
    svgOptimizer: svgoOptimizer({
      multipass: true,
      floatPrecision: 2,
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              // Keep inline styles + ids so animations / external CSS keep working.
              inlineStyles: false,
              removeIds: false,
            },
          },
        },
        'removeXMLNS',
      ],
    }),
  },
});
