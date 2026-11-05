import {TaskAuthoringForm} from "@/components/tasks/task-authoring-form";
export default async function EditTaskPage({params}:{params:Promise<{taskId:string}>}){return <TaskAuthoringForm mode="edit" identifier={(await params).taskId}/>}
