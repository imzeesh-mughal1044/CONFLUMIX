"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthHeader, AuthShell } from "@/components/auth/auth-shell";
import { Field, SubmitButton } from "@/components/auth/form-controls";
import { StatusPanel } from "@/components/auth/status-panel";
import { errorMessage, getAuthClient } from "@/lib/auth";
import { validateEmail } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const [emailError, setEmailError] = useState("");
  const [failure, setFailure] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const invalid = validateEmail(email);
    setEmailError(invalid);
    setFailure("");
    if (invalid) return;
    setLoading(true);
    try {
      const { error } = await getAuthClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` });
      if (error) throw error;
      setSent(true);
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return <AuthShell brandTitle="A fresh start is easy." brandCopy="We'll help you get back into your account." compact><AuthHeader title="Forgot your password?" description="Enter your email address to receive a reset link."/>{sent && <StatusPanel tone="success" title="Check your inbox">If an eligible account exists, password reset instructions have been sent to that address.</StatusPanel>}{failure && <StatusPanel tone="error">{failure}</StatusPanel>}{!sent && <form onSubmit={submit} noValidate><Field label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={emailError}/><SubmitButton loading={loading}>Send reset link</SubmitButton></form>}<Link className="quiet-link" href="/auth/login">← Back to sign in</Link></AuthShell>;
}
