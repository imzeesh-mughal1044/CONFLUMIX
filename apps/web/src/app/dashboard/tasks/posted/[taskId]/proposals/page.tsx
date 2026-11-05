import type { Metadata } from "next";
import { ProposalReviewPage } from "@/components/tasks/proposal-review-page";

export const metadata: Metadata = { title: "Review Proposals" };
export default async function Page({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  return <ProposalReviewPage identifier={taskId} />;
}
