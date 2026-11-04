"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { AuthHeader, AuthShell } from "@/components/auth/auth-shell";
import { Field, PasswordField, SubmitButton } from "@/components/auth/form-controls";
import { StatusPanel } from "@/components/auth/status-panel";
import { errorMessage, getAuthClient, safeReturnPath } from "@/lib/auth";
import { validateEmail } from "@/lib/validation";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const nextErrors = { email: validateEmail(email), password: password ? "" : "Enter your password." };
    setErrors(nextErrors);
    setFailure("");
    if (Object.values(nextErrors).some(Boolean)) return;
    setLoading(true);
    try {
      const { error } = await getAuthClient().auth.signInWithPassword({ email, password });
      if (error) throw new Error("We couldn't sign you in with those details. Check them and try again.");
      router.replace(safeReturnPath(params.get("next")));
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const next = safeReturnPath(params.get("next"), "");
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";

  return <AuthShell brandTitle="Welcome back." brandCopy="Your local exchange network is waiting."><AuthHeader title="Sign in" description="Continue where you left off."/>{failure && <StatusPanel tone="error">{failure}</StatusPanel>}<form onSubmit={submit} noValidate><Field label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email}/><PasswordField label="Password" name="password" autoComplete="current-password" placeholder="Enter your password" error={errors.password}/><div className="form-row form-row--end"><Link href={`/auth/forgot-password${nextQuery}`}>Forgot password?</Link></div><SubmitButton loading={loading}>Sign in</SubmitButton></form><p className="auth-switch">New to CONFLUMIX? <Link href={`/auth/register${nextQuery}`}>Create an account</Link></p></AuthShell>;
}

export default function LoginPage() {
  return <Suspense fallback={<AuthShell brandTitle="Welcome back." brandCopy="Your local exchange network is waiting."><AuthHeader title="Sign in" description="Loading your account access…"/></AuthShell>}><LoginContent/></Suspense>;
}
