"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthHeader, AuthShell } from "@/components/auth/auth-shell";
import { MailIcon } from "@/components/auth/icons";
import { StatusPanel } from "@/components/auth/status-panel";
import { errorMessage, getAuthClient, maskEmail } from "@/lib/auth";

type State = "pending" | "checking" | "success" | "expired" | "failed" | "resending" | "resent";

function VerifyEmailContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [state, setState] = useState<State>(() => params.get("error_code") === "otp_expired" ? "expired" : params.get("error") ? "failed" : "checking");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (params.get("error_code") === "otp_expired" || params.get("error")) return;
    let active = true;
    async function checkSession() {
      await Promise.resolve();
      try {
        const { data } = await getAuthClient().auth.getSession();
        if (active) setState(data.session ? "success" : "pending");
      } catch (error) {
        if (active) {
          setMessage(errorMessage(error));
          setState("pending");
        }
      }
    }
    void checkSession();
    return () => { active = false; };
  }, [params]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function resend() {
    if (!email || cooldown) return;
    setState("resending");
    setMessage("");
    try {
      const { error } = await getAuthClient().auth.resend({ type: "signup", email, options: { emailRedirectTo: `${window.location.origin}/auth/verify-email` } });
      if (error) throw error;
      setCooldown(60);
      setState("resent");
    } catch (error) {
      setMessage(errorMessage(error));
      setState("failed");
    }
  }

  const status = {
    checking: ["Checking verification", "Confirming your account status…"],
    pending: ["Check your inbox", email ? `We sent a verification link to ${maskEmail(email)}.` : "Use the verification link sent to your email address."],
    success: ["Email verified", "Your account is ready. You can continue to CONFLUMIX."],
    expired: ["Link expired", "This verification link is no longer valid. Request a fresh link below."],
    failed: ["We couldn't verify that link", message || "The link may be invalid or already used. Request a new one to continue."],
    resending: ["Sending a new link", "Please keep this page open for a moment."],
    resent: ["A new link is on its way", `Check ${email ? maskEmail(email) : "your inbox"} and follow the latest verification link.`],
  }[state];

  return <AuthShell brandTitle="One last step." brandCopy="Verify your email to continue with CONFLUMIX." compact><div className={`feature-icon ${state === "success" ? "feature-icon--success" : ""}`}><MailIcon/></div><AuthHeader title={status[0]} description={status[1]}/>{message && state === "pending" && <StatusPanel tone="warning">{message}</StatusPanel>}{state === "failed" && <StatusPanel tone="error">{message || "Verification failed. Request a new link or return to sign in."}</StatusPanel>}{state === "resent" && <StatusPanel tone="success">The resend request completed successfully.</StatusPanel>}<div className="action-stack">{state === "success" ? <Link className="primary-button" href="/">Continue</Link> : <button type="button" className="primary-button" onClick={resend} disabled={!email || state === "resending" || cooldown > 0}>{state === "resending" ? "Sending…" : cooldown ? `Resend in ${cooldown}s` : "Resend verification email"}</button>}</div><Link className="quiet-link" href="/auth/login">← Back to sign in</Link></AuthShell>;
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<AuthShell brandTitle="One last step." brandCopy="Verify your email to continue with CONFLUMIX." compact><AuthHeader title="Checking verification" description="Confirming your account status…"/></AuthShell>}><VerifyEmailContent/></Suspense>;
}
