"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthHeader, AuthShell } from "@/components/auth/auth-shell";
import { Field, PasswordField, SubmitButton } from "@/components/auth/form-controls";
import { StatusPanel } from "@/components/auth/status-panel";
import { errorMessage, getAuthClient } from "@/lib/auth";
import { validateEmail, validatePassword } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("fullName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    const consent = data.get("consent") === "on";
    const nextErrors = { fullName: fullName ? "" : "Enter your full name.", email: validateEmail(email), password: validatePassword(password), confirmPassword: confirmPassword === password ? "" : "Passwords must match.", consent: consent ? "" : "Accept the terms and privacy notice to continue." };
    setErrors(nextErrors);
    setFailure("");
    if (Object.values(nextErrors).some(Boolean)) return;
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/verify-email`;
      const { data: result, error } = await getAuthClient().auth.signUp({ email, password, options: { emailRedirectTo: redirectTo, data: { full_name: fullName, contact_number: String(data.get("phone") ?? "").trim() || null } } });
      if (error) throw error;
      if (result.session) router.replace("/");
      else router.replace(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      const message = errorMessage(error);
      setFailure(message.toLowerCase().includes("already") ? "An account may already use this email. Try signing in or reset your password." : message);
    } finally {
      setLoading(false);
    }
  }

  return <AuthShell brandTitle="Your next exchange starts here." brandCopy="One account. Four ways to exchange value."><AuthHeader title="Create your account" description="Join the CONFLUMIX community."/>{failure && <StatusPanel tone="error">{failure}</StatusPanel>}<form onSubmit={submit} noValidate><div className="field-grid"><Field label="Full name" name="fullName" autoComplete="name" placeholder="Your full name" error={errors.fullName}/><Field label="Contact number" name="phone" type="tel" autoComplete="tel" placeholder="Optional"/></div><Field label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email}/><div className="field-grid"><PasswordField label="Password" name="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password}/><PasswordField label="Confirm password" name="confirmPassword" autoComplete="new-password" placeholder="Repeat password" error={errors.confirmPassword}/></div><label className={`checkbox consent ${errors.consent ? "checkbox--error" : ""}`}><input type="checkbox" name="consent"/><span>I agree to the <Link href="/terms">terms</Link> and <Link href="/privacy">privacy notice</Link>.</span></label>{errors.consent && <p className="standalone-error">{errors.consent}</p>}<SubmitButton loading={loading}>Create account</SubmitButton></form><p className="auth-switch">Already have an account? <Link href="/auth/login">Sign in</Link></p></AuthShell>;
}
