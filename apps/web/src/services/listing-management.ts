import { products } from "@/data/products";
import { readStoredListings, saveStoredListing } from "./product-listings";
import type { ListingFormData } from "@/types/product-listing";
import type { BulkExecutionResult, BulkOperation, BulkPreview, ManagedListing, ManagedListingStatus, OperationChange, OperationHistoryRecord, PendingBulkOperation, RollbackAssessment, RollbackResult } from "@/types/listing-management";

const overrideKey = "conflumix:listing-management-overrides:v1";
const pendingKey = "conflumix:pending-bulk-operation:v1";
const executedKey = "conflumix:executed-bulk-operation-ids:v1";
const historyKey = "conflumix:bulk-operation-history:v1";
type Override = { price?: number; quantity?: number; status?: ManagedListingStatus; updatedAt: string };
function readOverrides(): Record<string, Override> { try { return JSON.parse(localStorage.getItem(overrideKey) ?? "{}"); } catch { return {}; } }
function writeOverrides(value: Record<string, Override>) { localStorage.setItem(overrideKey, JSON.stringify(value)); }

export function readManagedListings(seller: string): ManagedListing[] {
  const overrides = readOverrides();
  const fixture: ManagedListing[] = products.filter((item) => item.seller === seller).map((item) => ({ id: item.id, slug: item.slug, title: item.title, sku: item.id.toUpperCase(), category: item.category, price: overrides[item.id]?.price ?? item.price, quantity: overrides[item.id]?.quantity ?? item.stock, status: overrides[item.id]?.status ?? "active", image: item.image, updatedAt: overrides[item.id]?.updatedAt ?? item.createdAt, seller, source: "catalogue" }));
  const local: ManagedListing[] = readStoredListings().filter((item) => item.id).map((item) => ({ id: item.id!, slug: item.id!, title: item.title, sku: item.sku || undefined, category: item.category || "Uncategorized", subcategory: item.subcategory || undefined, price: Number(item.price), quantity: Number(item.quantity), status: overrides[item.id!]?.status ?? (item.status === "published" ? "active" : "draft"), image: item.images[0]?.src ?? "/products/home.jpg", updatedAt: overrides[item.id!]?.updatedAt, seller, source: "local" }));
  return [...fixture, ...local];
}

export function prepareBulkOperation(listings: ManagedListing[], operation: BulkOperation): BulkPreview {
  const chosen = listings.filter((item) => operation.selectedIds.includes(item.id));
  const eligible: BulkPreview["eligible"] = [], excluded: BulkPreview["excluded"] = [];
  const invalidNumber = (operation.type === "set-price" && (!Number.isFinite(operation.value) || (operation.value ?? 0) <= 0)) || (operation.type === "set-quantity" && (!Number.isInteger(operation.value) || (operation.value ?? -1) < 0 || (operation.value ?? 0) > 100000));
  operation.selectedIds.filter((id) => !listings.some((item) => item.id === id)).forEach((id) => excluded.push({ listing: { id, slug: id, title: "Unavailable product", category: "Uncategorized", price: 0, quantity: 0, status: "draft", image: "/products/home.jpg", seller: "", source: "local" }, reason: "This selected product no longer exists or is not owned by this store." }));
  if (invalidNumber) return { operation, eligible, excluded: [...excluded, ...chosen.map((listing) => ({ listing, reason: operation.type === "set-price" ? "The requested price is invalid." : "The requested quantity is invalid." }))], valid: false, error: operation.type === "set-price" ? "Enter a price greater than zero." : "Enter a whole quantity from 0 to 100,000." };
  chosen.forEach((listing) => {
    if ((operation.type === "deactivate" || operation.type === "archive") && listing.status !== "active") { excluded.push({ listing, reason: `Only active listings can be ${operation.type === "archive" ? "archived" : "deactivated"}.` }); return; }
    const before = operation.type === "set-price" ? `PKR ${listing.price.toLocaleString("en-PK")}` : operation.type === "set-quantity" ? String(listing.quantity) : listing.status;
    const after = operation.type === "set-price" ? `PKR ${operation.value!.toLocaleString("en-PK")}` : operation.type === "set-quantity" ? String(operation.value) : operation.type === "export" ? "Included in CSV" : operation.type === "archive" ? "archived" : "deactivated";
    eligible.push({ listing, before, after });
  });
  return { operation, eligible, excluded, valid: chosen.length > 0 && eligible.length > 0 };
}

function signature(item: ManagedListing) { return [item.id,item.price,item.quantity,item.status,item.updatedAt ?? ""].join("|"); }
export function createPendingOperation(seller: string, storeId: string, listings: ManagedListing[], operation: BulkOperation): PendingBulkOperation {
  const selected = listings.filter((item) => operation.selectedIds.includes(item.id));
  const pending: PendingBulkOperation = { id: `bulk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`, seller, storeId, operation, preparedAt: new Date().toISOString(), state: "prepared", snapshot: Object.fromEntries(selected.map((item) => [item.id,signature(item)])) };
  sessionStorage.setItem(pendingKey,JSON.stringify(pending)); return pending;
}
export function readPendingOperation(): PendingBulkOperation | null { try { return JSON.parse(sessionStorage.getItem(pendingKey) ?? "null"); } catch { return null; } }
export function clearPendingOperation(state: "cancelled"|"completed" = "cancelled") { const pending=readPendingOperation(); if(pending) sessionStorage.setItem(pendingKey,JSON.stringify({ ...pending,state })); if(state==="cancelled") sessionStorage.removeItem(pendingKey); }
export function pendingIsStale(pending: PendingBulkOperation, listings: ManagedListing[]) { return pending.operation.selectedIds.some((id) => { const current=listings.find((item)=>item.id===id); return !current || pending.snapshot[id] !== signature(current); }); }
export function refreshPendingSnapshot(pending: PendingBulkOperation, listings: ManagedListing[]) { const next={ ...pending,state:"preview-ready" as const,snapshot:Object.fromEntries(listings.filter((item)=>pending.operation.selectedIds.includes(item.id)).map((item)=>[item.id,signature(item)])) }; sessionStorage.setItem(pendingKey,JSON.stringify(next)); return next; }

export function executeBulkOperation(preview: BulkPreview) {
  if (!preview.valid) return { changed: 0, skipped: preview.excluded.length };
  if (preview.operation.type === "export") { exportCsv(preview.eligible.map((item) => item.listing)); return { changed: preview.eligible.length, skipped: preview.excluded.length }; }
  const overrides = readOverrides();
  preview.eligible.forEach(({ listing }) => {
    const next: Override = { ...overrides[listing.id], updatedAt: new Date().toISOString() };
    if (preview.operation.type === "set-price") next.price = preview.operation.value;
    if (preview.operation.type === "set-quantity") next.quantity = preview.operation.value;
    if (preview.operation.type === "deactivate") next.status = "deactivated";
    if (preview.operation.type === "archive") next.status = "archived";
    overrides[listing.id] = next;
    if (listing.source === "local") { const record = readStoredListings().find((item) => item.id === listing.id); if (record) saveStoredListing(updateLocal(record, preview.operation)); }
  });
  writeOverrides(overrides);
  return { changed: preview.eligible.length, skipped: preview.excluded.length };
}
export function executePendingOperation(pending: PendingBulkOperation, preview: BulkPreview): BulkExecutionResult {
  const executed: string[] = JSON.parse(sessionStorage.getItem(executedKey) ?? "[]");
  if (executed.includes(pending.id)) return { operationId:pending.id,operationType:pending.operation.type,executedAt:new Date().toISOString(),selected:pending.operation.selectedIds.length,changed:0,skipped:preview.excluded.length,failed:preview.eligible.length,status:"failed",localPrototype:true };
  const executedAt=new Date().toISOString(), changes=preview.operation.type==="export"?[]:preview.eligible.map(({listing})=>changeFor(listing,preview.operation));
  const outcome=executeBulkOperation(preview); executed.push(pending.id); sessionStorage.setItem(executedKey,JSON.stringify(executed)); clearPendingOperation("completed");
  const status=outcome.changed===0?"failed":outcome.skipped?"partial":"completed";
  const record:OperationHistoryRecord={id:pending.id,seller:pending.seller,storeId:pending.storeId,actor:pending.seller,type:pending.operation.type,parameters:{value:pending.operation.value},preparedAt:pending.preparedAt,executedAt,status,selectedIds:pending.operation.selectedIds,changes,skipped:preview.excluded.map((item)=>({productId:item.listing.id,productTitle:item.listing.title,reason:item.reason})),failed:[],rollbackState:pending.operation.type==="export"||!changes.length?"not-reversible":outcome.skipped?"partial-available":"available"};
  appendHistory(record);
  return { operationId:pending.id,operationType:pending.operation.type,executedAt,selected:pending.operation.selectedIds.length,changed:outcome.changed,skipped:outcome.skipped,failed:0,status,localPrototype:true };
}
function changeFor(listing:ManagedListing,operation:BulkOperation):OperationChange { if(operation.type==="set-price")return{productId:listing.id,productTitle:listing.title,image:listing.image,field:"price",before:listing.price,after:operation.value!,restored:false};if(operation.type==="set-quantity")return{productId:listing.id,productTitle:listing.title,image:listing.image,field:"quantity",before:listing.quantity,after:operation.value!,restored:false};return{productId:listing.id,productTitle:listing.title,image:listing.image,field:"status",before:listing.status,after:operation.type==="archive"?"archived":"deactivated",restored:false} }
export function readOperationHistory(seller:string):OperationHistoryRecord[]{try{const all=JSON.parse(localStorage.getItem(historyKey)??"[]") as OperationHistoryRecord[];return all.filter((item)=>item.seller===seller).sort((a,b)=>b.executedAt.localeCompare(a.executedAt))}catch{return[]}}
function writeHistory(records:OperationHistoryRecord[]){localStorage.setItem(historyKey,JSON.stringify(records))}
function appendHistory(record:OperationHistoryRecord){let all:OperationHistoryRecord[]=[];try{all=JSON.parse(localStorage.getItem(historyKey)??"[]")}catch{}if(!all.some((item)=>item.id===record.id)){all.push(record);writeHistory(all)}}
function fieldValue(listing:ManagedListing,field:OperationChange["field"]){return field==="price"?listing.price:field==="quantity"?listing.quantity:listing.status}
export function assessRollback(operation:OperationHistoryRecord,listings:ManagedListing[]):RollbackAssessment{const eligible:RollbackAssessment["eligible"]=[],excluded:RollbackAssessment["excluded"]=[],snapshot:Record<string,string>={};operation.changes.forEach((change)=>{const listing=listings.find((item)=>item.id===change.productId),current=listing?fieldValue(listing,change.field):undefined;snapshot[change.productId]=`${change.field}|${String(current)}`;if(change.restored){excluded.push({change,listing,current,eligible:false,reason:"This change was already restored."})}else if(!listing){excluded.push({change,current,eligible:false,reason:"The product no longer exists or is not available to this seller."})}else if(current!==change.after){excluded.push({change,listing,current,eligible:false,reason:"The affected value changed after the original operation. The newer value will not be overwritten."})}else{eligible.push({change,listing,current,eligible:true})}});return{operation,eligible,excluded,assessedAt:new Date().toISOString(),snapshot,valid:operation.type!=="export"&&eligible.length>0}}
export function executeRollback(assessment:RollbackAssessment):RollbackResult{const overrides=readOverrides(),restoredIds=new Set<string>();assessment.eligible.forEach(({change,listing})=>{if(!listing)return;const next:Override={...overrides[change.productId],updatedAt:new Date().toISOString()};if(change.field==="price")next.price=change.before as number;if(change.field==="quantity")next.quantity=change.before as number;if(change.field==="status")next.status=change.before as ManagedListingStatus;overrides[change.productId]=next;restoredIds.add(change.productId);if(listing.source==="local"&&change.field!=="status"){const record=readStoredListings().find((item)=>item.id===listing.id);if(record){const operation:BulkOperation=change.field==="price"?{type:"set-price",value:change.before as number,selectedIds:[listing.id]}:{type:"set-quantity",value:change.before as number,selectedIds:[listing.id]};saveStoredListing(updateLocal(record,operation))}}});writeOverrides(overrides);
  let all:OperationHistoryRecord[]=[];try{all=JSON.parse(localStorage.getItem(historyKey)??"[]")}catch{}const originalIndex=all.findIndex((item)=>item.id===assessment.operation.id);if(originalIndex>=0){const original=all[originalIndex];const changes=original.changes.map((change)=>restoredIds.has(change.productId)?{...change,restored:true}:change);const remaining=changes.filter((change)=>!change.restored).length;all[originalIndex]={...original,changes,rollbackState:remaining===0?"rolled-back":"partially-rolled-back"}}
  const now=new Date().toISOString(),rollback:OperationHistoryRecord={id:`rollback-${Date.now().toString(36)}`,originalOperationId:assessment.operation.id,seller:assessment.operation.seller,storeId:assessment.operation.storeId,actor:assessment.operation.actor,type:"rollback",parameters:{originalType:assessment.operation.type as BulkOperation["type"]},preparedAt:assessment.assessedAt,executedAt:now,status:assessment.eligible.length===0?"failed":assessment.excluded.length?"partial":"completed",selectedIds:assessment.operation.changes.map((item)=>item.productId),changes:assessment.eligible.map(({change})=>({...change,before:change.after,after:change.before,restored:false})),skipped:assessment.excluded.map(({change,reason})=>({productId:change.productId,productTitle:change.productTitle,reason:reason??"Not eligible"})),failed:[],rollbackState:"not-reversible"};all.push(rollback);writeHistory(all);return{historyRecord:rollback,restored:assessment.eligible.length,skipped:assessment.excluded.length,failed:0}}
function updateLocal(record: ListingFormData, operation: BulkOperation): ListingFormData { return { ...record, price: operation.type === "set-price" ? String(operation.value) : record.price, quantity: operation.type === "set-quantity" ? String(operation.value) : record.quantity }; }
function exportCsv(listings: ManagedListing[]) { const rows = [["ID","SKU","Title","Category","Subcategory","Price PKR","Quantity","Status"], ...listings.map((item) => [item.id,item.sku ?? "",item.title,item.category,item.subcategory ?? "",String(item.price),String(item.quantity),item.status])]; const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"','""')}"`).join(",")).join("\r\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href=url; link.download=`conflumix-products-${new Date().toISOString().slice(0,10)}.csv`; link.click(); URL.revokeObjectURL(url); }
