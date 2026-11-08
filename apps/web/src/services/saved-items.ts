import type { AuthSession } from "@/lib/auth";
import type { SavedItemMode, SavedItemRecord } from "@/types/account";
const key=(email:string)=>`conflumix:saved-items:${encodeURIComponent(email.toLowerCase())}:v1`;
export const savedItemsEvent="conflumix-saved-items";
export function readSavedItems(session:AuthSession):SavedItemRecord[]{try{const value=JSON.parse(localStorage.getItem(key(session.email))??"[]");return Array.isArray(value)?value:[]}catch{return[]}}
function write(session:AuthSession,records:SavedItemRecord[]){localStorage.setItem(key(session.email),JSON.stringify(records));window.dispatchEvent(new Event(savedItemsEvent))}
export function isItemSaved(session:AuthSession,mode:SavedItemMode,itemId:string){return readSavedItems(session).some(item=>item.mode===mode&&item.itemId===itemId)}
export function saveItem(session:AuthSession,mode:SavedItemMode,itemId:string){const records=readSavedItems(session);if(records.some(item=>item.mode===mode&&item.itemId===itemId))return records;const next=[{id:`${mode}:${itemId}`,mode,itemId,savedAt:new Date().toISOString()},...records];write(session,next);return next}
export function removeSavedItem(session:AuthSession,mode:SavedItemMode,itemId:string){const next=readSavedItems(session).filter(item=>!(item.mode===mode&&item.itemId===itemId));write(session,next);return next}
