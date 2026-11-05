import { TaskWorkroomPage } from "@/components/tasks/task-workroom-page";

export default async function Page({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <TaskWorkroomPage identifier={taskId} />;
}
