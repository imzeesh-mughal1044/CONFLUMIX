import type { Metadata } from "next";
import { TaskDetailRoute } from "@/components/tasks/task-detail-route";
import { findTask } from "@/services/tasks";
export async function generateMetadata({params}:{params:Promise<{taskId:string}>}):Promise<Metadata>{const task=findTask((await params).taskId);return{title:task?.title??"Task not found"}}
export default async function TaskPage({params}:{params:Promise<{taskId:string}>}){return <TaskDetailRoute identifier={(await params).taskId}/>} 
