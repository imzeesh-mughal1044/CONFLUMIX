import Link from "next/link";
import { AuthHeader, AuthShell } from "@/components/auth/auth-shell";
import { LockIcon } from "@/components/auth/icons";
import { safeReturnPath } from "@/lib/auth";

export default async function RequiredPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next ?? null, "/");
  const query = `?next=${encodeURIComponent(next)}`;
  return <AuthShell brandTitle="Your exchange journey continues here." brandCopy="Sign in to access your CONFLUMIX account." compact><div className="feature-icon"><LockIcon/></div><AuthHeader title="Sign in required" description="This page is available to signed-in users."/><div className="action-stack"><Link className="primary-button" href={`/auth/login${query}`}>Sign in</Link><Link className="secondary-button" href={`/auth/register${query}`}>Create account</Link></div><Link className="quiet-link" href={next}>← Return to previous page</Link></AuthShell>;
}
