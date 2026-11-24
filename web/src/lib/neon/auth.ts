import { neon } from "./client";

export type AdminSignInResult = "ok" | "invalid" | "forbidden" | "too_many" | "error";

function failure(status: unknown): AdminSignInResult {
  if (status === 429) return "too_many";
  if (status === 401 || status === 400) return "invalid";
  return "error";
}

/**
 * Signs in through Neon Auth (Managed Better Auth) and rejects anyone who is
 * not an admin in `profiles`. A non-admin session is signed out immediately so
 * the panel never stays authenticated with the wrong role.
 *
 * The SDK throws an AuthApiError for 4xx responses and returns `{ error }` for
 * other failures, so both paths are handled here.
 */
export async function signInAdmin(email: string, password: string): Promise<AdminSignInResult> {
  let userId: string;

  try {
    const { data, error } = await neon.auth.signIn.email({ email: email.trim(), password });
    if (error) return failure(error.status);
    if (!data?.user) return "error";
    userId = data.user.id;
  } catch (err) {
    return failure((err as { status?: number } | null)?.status);
  }

  try {
    // `profiles` RLS lets a user read only their own row.
    const { data: profile, error: profileError } = await neon
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || profile?.role !== "admin") {
      await neon.auth.signOut();
      return "forbidden";
    }
  } catch {
    await neon.auth.signOut().catch(() => {});
    return "error";
  }

  return "ok";
}
