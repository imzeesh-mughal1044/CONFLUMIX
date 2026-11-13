import Link from "next/link";
import type {ButtonHTMLAttributes, ReactNode} from "react";

type StateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "quiet";
};

type CardKind = "product" | "reuse" | "task" | "donation" | "summary";

function StateActions({actions}: {actions?: StateAction[]}) {
  if (!actions?.length) return null;
  return <div className="async-state__actions">{actions.map((action) => {
    const className = `button button--${action.variant ?? "secondary"}`;
    return action.href
      ? <Link className={className} href={action.href} key={`${action.label}-${action.href}`}>{action.label}</Link>
      : <button className={className} type="button" onClick={action.onClick} key={action.label}>{action.label}</button>;
  })}</div>;
}

function StateMark({tone}: {tone: "empty" | "error"}) {
  return <svg className={`async-state__mark async-state__mark--${tone}`} viewBox="0 0 48 48" aria-hidden="true"><circle cx="21" cy="21" r="12"/><path d="m30 30 9 9"/><path d={tone === "error" ? "M21 15v8m0 5h.01" : "M15 21h12"}/></svg>;
}

export function EmptyState({title, description, actions}: {title: string; description: string; actions?: StateAction[]}) {
  return <section className="async-state async-state--empty"><StateMark tone="empty"/><h2>{title}</h2><p>{description}</p><StateActions actions={actions}/></section>;
}

export function ErrorState({title, description, onRetry, actions}: {title: string; description: string; onRetry?: () => void; actions?: StateAction[]}) {
  const next = onRetry ? [{label: "Try Again", onClick: onRetry, variant: "primary" as const}, ...(actions ?? [])] : actions;
  return <section className="async-state async-state--error" role="alert"><StateMark tone="error"/><h2>{title}</h2><p>{description}</p><StateActions actions={next}/></section>;
}

export function SkeletonGrid({kind, count = 6, label}: {kind: CardKind; count?: number; label?: string}) {
  return <div className={`skeleton-grid skeleton-grid--${kind}`} role="status" aria-label={label ?? "Loading content"}><span className="sr-only">{label ?? "Loading content"}</span>{Array.from({length: count}, (_, index) => <div className="skeleton-card" aria-hidden="true" key={index}><i/><span/><span/><span/></div>)}</div>;
}

export function SkeletonTable({columns, rows = 5, label = "Loading table"}: {columns: number; rows?: number; label?: string}) {
  return <div className="skeleton-table" role="status" aria-label={label}><span className="sr-only">{label}</span>{Array.from({length: rows}, (_, row) => <div style={{gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`}} aria-hidden="true" key={row}>{Array.from({length: columns}, (_, column) => <span key={column}/>)}</div>)}</div>;
}

export function PageLoadingState({label = "Loading page", kind = "summary"}: {label?: string; kind?: CardKind}) {
  return <div className="page-loading-state"><SkeletonGrid kind={kind} count={kind === "summary" ? 4 : 6} label={label}/></div>;
}

export function LoadingButton({loading, loadingLabel = "Processing…", children, disabled, className = "button button--primary", ...props}: ButtonHTMLAttributes<HTMLButtonElement> & {loading: boolean; loadingLabel?: string; children: ReactNode}) {
  return <button {...props} className={className} disabled={disabled || loading} aria-busy={loading}>{loading && <span className="loading-spinner" aria-hidden="true"/>}<span>{loading ? loadingLabel : children}</span></button>;
}

export function ProgressIndicator({label, value}: {label: string; value?: number}) {
  const determinate = typeof value === "number";
  const normalized = determinate ? Math.min(100, Math.max(0, value)) : undefined;
  return <div className="progress-indicator" role="progressbar" aria-label={label} aria-valuemin={determinate ? 0 : undefined} aria-valuemax={determinate ? 100 : undefined} aria-valuenow={normalized}><div><span style={determinate ? {width: `${normalized}%`} : undefined}/></div><p>{label}{determinate ? ` · ${normalized}%` : ""}</p></div>;
}
