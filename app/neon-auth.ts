import { env } from "cloudflare:workers";
import { createNeonAuth, type NeonAuth } from "@neondatabase/auth/next/server";
import { redirect } from "next/navigation";

type AuthEnvironment = {
  NEON_AUTH_BASE_URL?: string;
  NEON_AUTH_COOKIE_SECRET?: string;
};

export type AppUser = {
  id: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

let authInstance: NeonAuth | undefined;

export function getNeonAuth() {
  const runtime = env as unknown as AuthEnvironment;
  if (!runtime.NEON_AUTH_BASE_URL || !runtime.NEON_AUTH_COOKIE_SECRET) {
    throw new Error("Neon Auth is not configured. Add NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET to the server environment.");
  }

  authInstance ??= createNeonAuth({
    baseUrl: runtime.NEON_AUTH_BASE_URL,
    cookies: {
      secret: runtime.NEON_AUTH_COOKIE_SECRET,
      sessionDataTtl: 300,
      sameSite: "lax",
    },
    logLevel: "warn",
  });
  return authInstance;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const { data } = await getNeonAuth().getSession();
    if (!data?.user?.id || !data.user.email) return null;
    const name = data.user.name?.trim() || data.user.email;
    return {
      id: data.user.id,
      displayName: name,
      email: data.user.email,
      fullName: data.user.name?.trim() || null,
    };
  } catch {
    return null;
  }
}

export async function requireUser(returnTo: string): Promise<AppUser> {
  const user = await getCurrentUser();
  if (user) return user;
  redirect(`/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
}

function safeReturnTo(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}
