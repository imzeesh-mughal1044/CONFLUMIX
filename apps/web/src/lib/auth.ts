import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export type AuthSession = { email: string; fullName: string };
const frontendSessionKey = "conflumix.frontend.session";

export function readFrontendSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(
      localStorage.getItem(frontendSessionKey) ?? "null",
    ) as Partial<AuthSession> | null;
    return value?.email
      ? {
          email: value.email,
          fullName: value.fullName || value.email.split("@")[0],
        }
      : null;
  } catch {
    return null;
  }
}

export async function readAuthSession(): Promise<AuthSession | null> {
  const local = readFrontendSession();
  if (local) return local;
  if (!authConfigured) return null;
  const { data } = await getAuthClient().auth.getSession();
  const user = data.session?.user;
  if (!user?.email) return null;
  const session = {
    email: user.email,
    fullName: String(user.user_metadata?.full_name || user.email.split("@")[0]),
  };
  localStorage.setItem(frontendSessionKey, JSON.stringify(session));
  return session;
}

export const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function getAuthClient() {
  if (!authConfigured) {
    throw new Error(
      "Authentication is not configured yet. Add the public Supabase environment variables to connect this form.",
    );
  }

  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    );
  }

  return client;
}

export async function signOutAccount() {
  if (authConfigured) {
    const { error } = await getAuthClient().auth.signOut();
    if (error) throw error;
  }
  localStorage.removeItem(frontendSessionKey);
}

export function safeReturnPath(value: string | null, fallback = "/") {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/auth/login")
  ) {
    return fallback;
  }
  return value;
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "your email address";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
