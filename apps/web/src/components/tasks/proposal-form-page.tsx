"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import {
  proposalEligibility,
  saveProposalDraft,
  submitProposal,
  type ProposalInput,
} from "@/services/task-proposals";
import { findTask } from "@/services/tasks";
import type { ProposalEligibility, TaskDetail } from "@/types/tasks";

const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ProposalFormPage({ identifier }: { identifier: string }) {
  const router = useRouter();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [task, setTask] = useState<TaskDetail | null | undefined>();
  const [session, setSession] = useState<AuthSession | null | undefined>();
  const [eligibility, setEligibility] = useState<ProposalEligibility>();
  const [approach, setApproach] = useState("");
  const [experience, setExperience] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [compensation, setCompensation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const found = findTask(identifier) ?? null;
    void readAuthSession().then((current) => {
      setTask(found);
      setSession(current);
      if (!current) {
        router.replace(
          `/auth/required?next=${encodeURIComponent(`/tasks/${identifier}/propose`)}`,
        );
        return;
      }
      const result = proposalEligibility(found ?? undefined, current);
      setEligibility(result);
      if (result.allowed && result.draft) {
        setApproach(result.draft.approach);
        setExperience(result.draft.experience);
        setCompletionDate(result.draft.completionDate);
        setCompensation(
          result.draft.proposedCompensation
            ? String(result.draft.proposedCompensation)
            : "",
        );
        setNotice("Your browser-local proposal draft has been restored.");
      }
    });
  }, [identifier, router]);

  function validate() {
    const next: Record<string, string> = {};
    if (approach.trim().length < 80)
      next.approach =
        "Explain your approach and expected deliverable in at least 80 characters.";
    if (experience.trim() && experience.trim().length < 20)
      next.experience =
        "Add a little more context, or leave this optional field empty.";
    if (!completionDate)
      next.completionDate = "Choose your proposed completion date.";
    else if (completionDate <= "2026-11-04")
      next.completionDate = "Choose a future completion date.";
    else if (task && completionDate > task.deadline)
      next.completionDate = `Choose a date on or before the task deadline, ${dateFormat.format(new Date(`${task.deadline}T00:00:00`))}.`;
    if (!Number.isFinite(Number(compensation)) || Number(compensation) <= 0)
      next.compensation = "Enter a proposed compensation greater than zero.";
    setErrors(next);
    if (Object.keys(next).length) {
      queueMicrotask(() => summaryRef.current?.focus());
      return false;
    }
    return true;
  }

  function input(): ProposalInput {
    return {
      approach: approach.trim(),
      experience: experience.trim(),
      completionDate,
      proposedCompensation: Number(compensation),
    };
  }

  async function saveDraft() {
    if (!task || !session) return;
    if (!approach.trim()) {
      setErrors({ approach: "Start your proposed approach before saving." });
      summaryRef.current?.focus();
      return;
    }
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    const result = saveProposalDraft(task, session, input());
    setBusy(false);
    if ("allowed" in result) {
      setEligibility(result);
      return;
    }
    setNotice("Proposal draft saved in this browser.");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!task || !session || !validate()) return;
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 180));
    const result = submitProposal(task, session, input());
    setBusy(false);
    if ("allowed" in result) {
      setEligibility(result);
      return;
    }
    router.push("/dashboard/tasks/proposals?submitted=1");
  }

  if (task === undefined || session === undefined || eligibility === undefined)
    return (
      <PublicShell>
        <div className="page-container proposal-loading" role="status">
          <div />
          <div />
          <div />
        </div>
      </PublicShell>
    );

  if (!task)
    return (
      <ProposalState
        title="Task not found"
        body="The proposal form cannot open because this task does not exist in the current catalogue."
        href="/tasks/browse"
        label="Browse Tasks"
      />
    );

  if (!eligibility.allowed) {
    const href =
      eligibility.reason === "duplicate"
        ? "/dashboard/tasks/proposals"
        : `/tasks/${task.slug}`;
    return (
      <ProposalState
        title="Proposal unavailable"
        body={eligibility.message}
        href={href}
        label={
          eligibility.reason === "duplicate" ? "My Proposals" : "View Task"
        }
        secondaryHref="/tasks/browse"
      />
    );
  }

  return (
    <PublicShell>
      <div className="proposal-page">
        <div className="page-container">
          <nav className="task-detail__breadcrumb" aria-label="Breadcrumb">
            <Link href="/tasks">Tasks</Link>
            <span>/</span>
            <Link href={`/tasks/${task.slug}`}>{task.title}</Link>
            <span>/</span>
            <span aria-current="page">Submit Proposal</span>
          </nav>
          <header className="proposal-page__header">
            <p className="section-kicker">Task &amp; Soft Skills Marketplace</p>
            <h1>Submit Proposal</h1>
            <p>
              Explain how you would solve this specific task and when you can
              deliver.
            </p>
          </header>
          <div className="proposal-page__layout">
            <aside
              className="proposal-task-summary"
              aria-labelledby="task-summary-title"
            >
              <div>
                <p className="section-kicker">Task summary</p>
                <h2 id="task-summary-title">{task.title}</h2>
                <p>{task.description}</p>
              </div>
              <dl>
                <div>
                  <dt>Category</dt>
                  <dd>{task.category}</dd>
                </div>
                <div>
                  <dt>Owner</dt>
                  <dd>{task.owner}</dd>
                </div>
                <div>
                  <dt>Deadline</dt>
                  <dd>
                    {dateFormat.format(new Date(`${task.deadline}T00:00:00`))}
                  </dd>
                </div>
                <div>
                  <dt>Owner budget</dt>
                  <dd>{money.format(task.budget)}</dd>
                </div>
                <div>
                  <dt>Arrangement</dt>
                  <dd>{task.arrangement}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Open for proposals</dd>
                </div>
              </dl>
              <div className="task-skills" aria-label="Required skills">
                {task.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
              <Link href={`/tasks/${task.slug}`}>View full task</Link>
            </aside>
            <main className="proposal-form-panel">
              {Object.keys(errors).length > 0 && (
                <div
                  ref={summaryRef}
                  tabIndex={-1}
                  className="task-error-summary"
                  role="alert"
                >
                  <h2>Review your proposal</h2>
                  <ul>
                    {Object.entries(errors).map(([id, message]) => (
                      <li key={id}>
                        <a href={`#${id}`}>{message}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {notice && (
                <p className="task-author-notice" role="status">
                  {notice}
                </p>
              )}
              <form onSubmit={submit} noValidate>
                <label htmlFor="approach">
                  Proposed approach <span aria-hidden="true">*</span>
                </label>
                <p id="approach-help">
                  Describe your understanding, planned steps, and expected
                  deliverable.
                </p>
                <textarea
                  id="approach"
                  rows={9}
                  value={approach}
                  aria-describedby={`approach-help${errors.approach ? " approach-error" : ""}`}
                  aria-invalid={Boolean(errors.approach)}
                  onChange={(event) => setApproach(event.target.value)}
                />
                {errors.approach && (
                  <span id="approach-error" className="field-error">
                    {errors.approach}
                  </span>
                )}

                <label htmlFor="experience">
                  Relevant experience or examples <span>(optional)</span>
                </label>
                <p id="experience-help">
                  Briefly mention similar work, relevant skills, or one
                  reference link.
                </p>
                <textarea
                  id="experience"
                  rows={5}
                  value={experience}
                  aria-describedby={`experience-help${errors.experience ? " experience-error" : ""}`}
                  aria-invalid={Boolean(errors.experience)}
                  onChange={(event) => setExperience(event.target.value)}
                />
                {errors.experience && (
                  <span id="experience-error" className="field-error">
                    {errors.experience}
                  </span>
                )}

                <div className="proposal-form-row">
                  <div>
                    <label htmlFor="completionDate">
                      Proposed completion date <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="completionDate"
                      type="date"
                      min="2026-11-05"
                      max={task.deadline}
                      value={completionDate}
                      aria-invalid={Boolean(errors.completionDate)}
                      onChange={(event) =>
                        setCompletionDate(event.target.value)
                      }
                    />
                    {errors.completionDate && (
                      <span className="field-error">
                        {errors.completionDate}
                      </span>
                    )}
                  </div>
                  <div>
                    <label htmlFor="compensation">
                      Proposed compensation (PKR){" "}
                      <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="compensation"
                      inputMode="numeric"
                      value={compensation}
                      aria-invalid={Boolean(errors.compensation)}
                      onChange={(event) => setCompensation(event.target.value)}
                    />
                    <p>Owner budget: {money.format(task.budget)}.</p>
                    {errors.compensation && (
                      <span className="field-error">{errors.compensation}</span>
                    )}
                  </div>
                </div>
                <div className="proposal-form-actions">
                  <button
                    className="button button--primary"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? "Saving…" : "Submit Proposal"}
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    disabled={busy}
                    onClick={() => void saveDraft()}
                  >
                    Save Draft
                  </button>
                  <Link href={`/tasks/${task.slug}`}>Cancel</Link>
                </div>
                <p className="proposal-boundary">
                  Submission sends an application to solve this task. It does
                  not mean you have been selected.
                </p>
              </form>
            </main>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function ProposalState({
  title,
  body,
  href,
  label,
  secondaryHref,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
  secondaryHref?: string;
}) {
  return (
    <PublicShell>
      <div className="page-container task-detail-missing">
        <p className="section-kicker">Task proposal</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="proposal-state-actions">
          <Link className="button button--primary" href={href}>
            {label}
          </Link>
          {secondaryHref && (
            <Link className="button button--secondary" href={secondaryHref}>
              Browse Tasks
            </Link>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
