import type { ProposalStatus } from "@/types/tasks";

const labels: Record<ProposalStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  completed: "Completed",
};

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span className={`proposal-status proposal-status--${status}`}>
      {labels[status]}
    </span>
  );
}
