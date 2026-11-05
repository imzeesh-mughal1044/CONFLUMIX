import type { Metadata } from "next";
import { ProposalFormPage } from "@/components/tasks/proposal-form-page";

export const metadata: Metadata = { title: "Submit Proposal" };

export default async function SubmitProposalPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <ProposalFormPage identifier={taskId} />;
}
