import { TaskHistoryPage } from "@/components/tasks/task-history-page";
export default async function Page({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <TaskHistoryPage identifier={taskId} />;
}
