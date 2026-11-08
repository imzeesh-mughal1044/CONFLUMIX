"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/public/icons";
import { readFrontendSession, type AuthSession } from "@/lib/auth";
import { isItemSaved, removeSavedItem, saveItem, savedItemsEvent } from "@/services/saved-items";
import type { SavedItemMode } from "@/types/account";
export function SaveItemButton({mode,itemId,returnPath}:{mode:SavedItemMode;itemId:string;returnPath:string}){const router=useRouter(),[session,setSession]=useState<AuthSession|null>(null),[saved,setSaved]=useState(false);useEffect(()=>{queueMicrotask(()=>{const value=readFrontendSession();setSession(value);setSaved(value?isItemSaved(value,mode,itemId):false)});const sync=()=>{const value=readFrontendSession();if(value)setSaved(isItemSaved(value,mode,itemId))};window.addEventListener(savedItemsEvent,sync);return()=>window.removeEventListener(savedItemsEvent,sync)},[mode,itemId]);function toggle(){if(!session){router.push(`/auth/login?next=${encodeURIComponent(returnPath)}`);return}if(saved)removeSavedItem(session,mode,itemId);else saveItem(session,mode,itemId)}return <button className={`save-item-button ${saved?"is-saved":""}`} type="button" aria-pressed={saved} onClick={toggle}><Icon name="heart"/>{saved?"Saved":"Save Item"}</button>}
