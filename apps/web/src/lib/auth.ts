import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

const frontendAccountKey = "conflumix.frontend.account";
const frontendSessionKey = "conflumix.frontend.session";
export const authSessionEvent = "conflumix-auth-session";

export type AuthSession = { email: string; fullName: string };
type FrontendAccount = AuthSession & { passwordHash: string };

export const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function getAuthClient() {
  if (!authConfigured) {
    throw new Error("Authentication is not configured yet. Add the public Supabase environment variables to connect this form.");
  }

  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
    );
  }

  return client;
}

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readStored<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "null") as T | null;
  } catch {
    return null;
  }
}

function announceSessionChange() {
  window.dispatchEvent(new Event(authSessionEvent));
}

export async function registerWithFrontendSession(fullName: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = readStored<FrontendAccount>(frontendAccountKey);
  if (existing?.email === normalizedEmail) throw new Error("An account already uses this email. Try signing in instead.");
  const account: FrontendAccount = { fullName: fullName.trim(), email: normalizedEmail, passwordHash: await hashPassword(password) };
  window.localStorage.setItem(frontendAccountKey, JSON.stringify(account));
  window.localStorage.removeItem(frontendSessionKey);
}

export function readFrontendSession() { return readStored<AuthSession>(frontendSessionKey); }

export async function signInWithFrontendSession(email: string, password: string) {
  const account = readStored<FrontendAccount>(frontendAccountKey);
  const matches = account?.email === email.trim().toLowerCase() && account.passwordHash === await hashPassword(password);
  if (!account || !matches) throw new Error("We couldn't sign you in with those details. Create an account or check your email and password.");
  const session: AuthSession = { email: account.email, fullName: account.fullName };
  window.localStorage.setItem(frontendSessionKey, JSON.stringify(session));
  announceSessionChange();
  return session;
}

export async function readAuthSession(): Promise<AuthSession | null> {
  if (!authConfigured) return readStored<AuthSession>(frontendSessionKey);
  const { data } = await getAuthClient().auth.getSession();
  if (!data.session?.user) return null;
  return { email: data.session.user.email ?? "", fullName: String(data.session.user.user_metadata.full_name ?? "Member") };
}

export async function signOut() {
  if (authConfigured) await getAuthClient().auth.signOut();
  else {
    window.localStorage.removeItem(frontendSessionKey);
  }
  announceSessionChange();
}

export function safeReturnPath(value: string | null, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/auth/login")) {
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
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
