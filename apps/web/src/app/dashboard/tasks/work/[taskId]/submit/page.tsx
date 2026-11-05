import { SubmitWorkPage } from "@/components/tasks/submit-work-page";
export default async function Page({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <SubmitWorkPage identifier={taskId} />;
}
