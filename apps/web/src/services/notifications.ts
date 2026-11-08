import type { AuthSession } from "@/lib/auth";
import type { AccountNotification } from "@/types/account";
import { readAccountActivity } from "./account-activity";

const key=(email:string)=>`conflumix:notifications-read:${encodeURIComponent(email.toLowerCase())}:v1`;
export const notificationEvent="conflumix-notifications";
function readIds(email:string){try{return new Set<string>(JSON.parse(localStorage.getItem(key(email))??"[]"))}catch{return new Set<string>()}}
function isNotifiable(title:string){return /order|offer|proposal|workroom|profile/i.test(title)}
export function readNotifications(session:AuthSession):AccountNotification[]{const read=readIds(session.email);return readAccountActivity(session).filter(item=>isNotifiable(item.title)).map(item=>({...item,read:read.has(item.id)}))}
export function unreadNotificationCount(session:AuthSession){return readNotifications(session).filter(item=>!item.read).length}
export function markNotificationRead(session:AuthSession,id:string){const available=readNotifications(session);if(!available.some(item=>item.id===id))return false;const read=readIds(session.email);read.add(id);localStorage.setItem(key(session.email),JSON.stringify([...read]));window.dispatchEvent(new Event(notificationEvent));return true}
export function markAllNotificationsRead(session:AuthSession){const read=readIds(session.email);readNotifications(session).forEach(item=>read.add(item.id));localStorage.setItem(key(session.email),JSON.stringify([...read]));window.dispatchEvent(new Event(notificationEvent))}
