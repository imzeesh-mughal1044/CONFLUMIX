import type { TaskProposal } from "@/types/tasks";
import { ProposalStatusBadge } from "./proposal-status-badge";

const dateFormat = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export function ProposalDetailContent({
  proposal,
  taskTitle,
  close,
}: {
  proposal: TaskProposal;
  taskTitle: string;
  close: () => void;
}) {
  return (
    <>
      <div className="task-preview-head">
        <div>
          <p className="section-kicker">Submitted proposal</p>
          <h2>{taskTitle}</h2>
          <p>
            Submitted by <strong>{proposal.solverName}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close proposal details"
        >
          ×
        </button>
      </div>
      <ProposalStatusBadge status={proposal.status} />
      <dl>
        <div>
          <dt>Submitted</dt>
          <dd>
            {proposal.submittedAt
              ? dateFormat.format(new Date(proposal.submittedAt))
              : "Not submitted"}
          </dd>
        </div>
        <div>
          <dt>Proposed completion</dt>
          <dd>
            {dateFormat.format(new Date(`${proposal.completionDate}T00:00:00`))}
          </dd>
        </div>
        {proposal.proposedCompensation !== undefined && (
          <div>
            <dt>Proposed compensation</dt>
            <dd>{money.format(proposal.proposedCompensation)}</dd>
          </div>
        )}
      </dl>
      <section>
        <h3>Proposal message and approach</h3>
        <p>{proposal.approach}</p>
      </section>
      <section>
        <h3>Relevant experience or examples</h3>
        <p>
          {proposal.experience ||
            "No additional experience or examples were provided."}
        </p>
      </section>
    </>
  );
}
