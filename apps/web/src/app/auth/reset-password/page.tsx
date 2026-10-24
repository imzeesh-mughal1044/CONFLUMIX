"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { AuthHeader, AuthShell } from "@/components/auth/auth-shell";
import { PasswordField, SubmitButton } from "@/components/auth/form-controls";
import { StatusPanel } from "@/components/auth/status-panel";
import { errorMessage, getAuthClient } from "@/lib/auth";
import { validatePassword } from "@/lib/validation";

type SessionState = "checking" | "valid" | "invalid" | "success";

export default function ResetPasswordPage() {
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    async function initialize() {
      await Promise.resolve();
      try {
        const auth = getAuthClient().auth;
        const { data } = await auth.getSession();
        if (active) setSessionState(data.session ? "valid" : "invalid");
        const { data: listener } = auth.onAuthStateChange((event, session) => {
          if (active && (event === "PASSWORD_RECOVERY" || session)) setSessionState("valid");
        });
        unsubscribe = () => listener.subscription.unsubscribe();
      } catch (error) {
        if (active) {
          setFailure(errorMessage(error));
          setSessionState("invalid");
        }
      }
    }
    void initialize();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    const nextErrors = { password: validatePassword(password), confirmPassword: password === confirmPassword ? "" : "Passwords must match." };
    setErrors(nextErrors);
    setFailure("");
    if (Object.values(nextErrors).some(Boolean)) return;
    setLoading(true);
    try {
      const { error } = await getAuthClient().auth.updateUser({ password });
      if (error) throw error;
      setSessionState("success");
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return <AuthShell brandTitle="Secure your account." brandCopy="Choose a new password to continue." compact><AuthHeader title={sessionState === "success" ? "Password updated" : "Set a new password"} description={sessionState === "success" ? "Your new password is ready to use." : "Use a strong password you haven't used here before."}/>{sessionState === "checking" && <StatusPanel>Checking your reset link…</StatusPanel>}{sessionState === "invalid" && <StatusPanel tone="warning" title="Reset link required">{failure || "This reset link is missing, invalid, or expired. Request a new link to continue."}</StatusPanel>}{failure && sessionState === "valid" && <StatusPanel tone="error">{failure}</StatusPanel>}{sessionState === "success" && <StatusPanel tone="success">Your password was updated successfully.</StatusPanel>}{sessionState === "valid" && <form onSubmit={submit} noValidate><PasswordField label="New password" name="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password} hint="Use 8 or more characters."/><PasswordField label="Confirm new password" name="confirmPassword" autoComplete="new-password" placeholder="Repeat your new password" error={errors.confirmPassword}/><SubmitButton loading={loading}>Update password</SubmitButton></form>}<div className="link-stack">{sessionState === "invalid" && <Link href="/auth/forgot-password">Request a new reset link</Link>}<Link className="quiet-link" href="/auth/login">← Back to sign in</Link></div></AuthShell>;
}
