import { AlertIcon, CheckIcon } from "./icons";

export function StatusPanel({ tone = "info", title, children }: { tone?: "info" | "error" | "success" | "warning"; title?: string; children: React.ReactNode }) {
  return <div className={`status status--${tone}`} role={tone === "error" ? "alert" : "status"}>{tone === "success" ? <CheckIcon className="status-icon"/> : <AlertIcon className="status-icon"/>}<div>{title && <strong>{title}</strong>}<div>{children}</div></div></div>;
}
