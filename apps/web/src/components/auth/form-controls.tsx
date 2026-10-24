"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, hint, id: suppliedId, className, ...props }, ref) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const messageId = `${id}-message`;
  return <div className={`field ${error ? "field--error" : ""} ${className ?? ""}`}><label htmlFor={id}>{label}</label><input ref={ref} id={id} aria-invalid={Boolean(error)} aria-describedby={error || hint ? messageId : undefined} {...props}/>{(error || hint) && <p id={messageId} className="field-message">{error || hint}</p>}</div>;
});

export function PasswordField({ label, error, hint, id, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  return <div className={`field ${error ? "field--error" : ""}`}><label htmlFor={inputId}>{label}</label><div className="password-wrap"><input id={inputId} type={visible ? "text" : "password"} aria-invalid={Boolean(error)} aria-describedby={error || hint ? messageId : undefined} {...props}/><button type="button" className="visibility-button" onClick={() => setVisible((value) => !value)} aria-label="Toggle password visibility" aria-pressed={visible}><span className="sr-only">{visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}</span>{visible ? <EyeOffIcon/> : <EyeIcon/>}</button></div>{(error || hint) && <p id={messageId} className="field-message">{error || hint}</p>}</div>;
}

export function SubmitButton({ children, loading, disabled }: { children: React.ReactNode; loading?: boolean; disabled?: boolean }) {
  return <button className="primary-button" type="submit" disabled={disabled || loading}>{loading && <span className="spinner" aria-hidden="true"/>}<span>{loading ? "Please wait…" : children}</span></button>;
}
