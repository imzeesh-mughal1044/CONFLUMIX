export const taskCategories: readonly string[] = [
  "Design",
  "Writing",
  "Programming",
  "Data Analysis",
  "Research",
  "Office and Digital Support",
];
export type TaskCategory = string;
export type TaskStatus =
  | "open"
  | "reviewing"
  | "solver-selected"
  | "in-progress"
  | "submitted"
  | "revision"
  | "completed"
  | "cancelled"
  | "closed"
  | "expired";
export type WorkArrangement = "Remote";
export type TaskOpportunity = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: TaskCategory;
  skills: string[];
  budget: number;
  deadline: string;
  status: TaskStatus;
  owner: string;
  arrangement: WorkArrangement;
  locality: string;
  createdAt: string;
};
export type TaskDetail = TaskOpportunity & {
  expectedDeliverable: string;
  requirements: string[];
  submissionExpectation: string;
};
export type TaskSort = "newest" | "deadline" | "budget-high" | "budget-low";
export type TaskQuery = {
  q?: string;
  category?: TaskCategory;
  skills?: string[];
  status?: TaskStatus;
  budget?: "under-5000" | "5000-10000" | "over-10000";
  deadline?: "7-days" | "30-days" | "later";
  arrangement?: "remote";
  locality?: string;
  sort?: TaskSort;
};
export type TaskExperience = "Beginner" | "Intermediate" | "Expert";
export type TaskBudgetType = "Fixed price" | "Hourly";
export type TaskDuration =
  | "A few hours"
  | "Less than a day"
  | "1–3 days"
  | "About a week";
export type AuthoredTask = Omit<TaskDetail, "status"> & {
  ownerEmail: string;
  authoringCategory: string;
  customCategoryName?: string;
  experience: TaskExperience;
  capability: string;
  duration: TaskDuration;
  budgetType: TaskBudgetType;
  compensationConditions: string;
  categoryFields: Record<string, string>;
  status:
    | "open"
    | "solver-selected"
    | "in-progress"
    | "submitted"
    | "revision"
    | "completed"
    | "cancelled"
    | "closed"
    | "draft";
  selectedProposalId?: string;
  selectedSolver?: string;
  selectedAt?: string;
  updatedAt: string;
};
export type TaskAuthoringField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "boolean";
  options?: string[];
  required?: boolean;
};
export type TaskAuthoringCategory = {
  id: string;
  label: string;
  group: string;
  fields: TaskAuthoringField[];
};
export type ProposalStatus =
  | "draft"
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "completed";
export type TaskProposal = {
  id: string;
  taskId: string;
  solverEmail: string;
  solverName: string;
  approach: string;
  experience: string;
  completionDate: string;
  proposedCompensation?: number;
  currency: "PKR";
  status: ProposalStatus;
  createdAt: string;
  submittedAt?: string;
  updatedAt: string;
  latestUpdate: string;
};
export type WorkSubmissionStatus =
  | "submitted"
  | "revision-requested"
  | "accepted";
export type WorkSubmission = {
  id: string;
  taskId: string;
  version: number;
  message: string;
  deliverableDescription: string;
  links: string[];
  completionNotes: string;
  note?: string;
  references?: string[];
  relatedRevisionId?: string;
  submittedAt: string;
  status: WorkSubmissionStatus;
};
export type TaskRevision = {
  id: string;
  taskId: string;
  submissionId: string;
  instructions: string;
  requestedAt: string;
  resolvedAt?: string;
};
export type TaskActivityType =
  | "solver-selected"
  | "work-started"
  | "work-submitted"
  | "work-resubmitted"
  | "revision-requested"
  | "submission-accepted"
  | "task-cancelled"
  | "task-closed";
export type TaskActivity = {
  id: string;
  taskId: string;
  type: TaskActivityType;
  actorName: string;
  occurredAt: string;
  detail: string;
};
export type TaskWorkroom = {
  taskId: string;
  status: Extract<
    TaskStatus,
    | "solver-selected"
    | "in-progress"
    | "submitted"
    | "revision"
    | "completed"
    | "cancelled"
    | "closed"
  >;
  submissions: WorkSubmission[];
  revisions: TaskRevision[];
  activity: TaskActivity[];
  updatedAt: string;
};
export type ProposalEligibility =
  | { allowed: true; draft?: TaskProposal }
  | {
      allowed: false;
      reason:
        | "not-found"
        | "authentication"
        | "owner"
        | "duplicate"
        | "lifecycle";
      message: string;
      existing?: TaskProposal;
    };
