import { createClient } from "@neon/neon-js";

/**
 * Neon database URL in HTTPS form, without credentials or query params, e.g.
 * `https://ep-xxx.c-9.us-east-2.aws.neon.tech/neondb`.
 *
 * The SDK derives the Managed Better Auth and Data API URLs from it.
 * Inlined at build time (PUBLIC_*), so it must exist in the deploy environment.
 */
const url = import.meta.env.PUBLIC_NEON_DB_URL;

if (!url) {
  console.warn("[neon] Missing PUBLIC_NEON_DB_URL — set it in .env.local and the deploy environment.");
}

/**
 * `allowAnonymous` gets a short-lived guest JWT for the Data API so public
 * pages (bracket, standings, registration form) work without sign-in.
 * RLS still limits anonymous visitors to the public reads and inserts.
 */
export const neon = createClient(url || "https://placeholder.invalid.example/neondb", {
  auth: { allowAnonymous: true },
});
