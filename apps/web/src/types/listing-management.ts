import type { ProductCategory } from "./products";

export type ManagedListingStatus = "active" | "draft" | "deactivated" | "archived";
export type ManagedListing = { id: string; slug: string; title: string; sku?: string; category: ProductCategory | "Uncategorized"; subcategory?: string; price: number; quantity: number; status: ManagedListingStatus; image: string; updatedAt?: string; seller: string; source: "catalogue" | "local" };
export type BulkOperationType = "set-price" | "set-quantity" | "deactivate" | "archive" | "export";
export type BulkOperation = { type: BulkOperationType; value?: number; selectedIds: string[] };
export type BulkPreviewItem = { listing: ManagedListing; before: string; after: string };
export type BulkExcludedItem = { listing: ManagedListing; reason: string };
export type BulkPreview = { operation: BulkOperation; eligible: BulkPreviewItem[]; excluded: BulkExcludedItem[]; valid: boolean; error?: string };
export type PendingBulkOperation = { id: string; seller: string; storeId: string; operation: BulkOperation; preparedAt: string; state: "prepared" | "preview-ready" | "completed" | "cancelled"; snapshot: Record<string, string> };
export type BulkExecutionResult = { operationId: string; operationType: BulkOperationType; executedAt: string; selected: number; changed: number; skipped: number; failed: number; status: "completed" | "partial" | "failed"; localPrototype: true };
export type OperationStatus = "completed" | "partial" | "failed";
export type RollbackState = "available" | "partial-available" | "not-reversible" | "rolled-back" | "partially-rolled-back";
export type OperationChange = { productId: string; productTitle: string; image: string; field: "price" | "quantity" | "status"; before: number | ManagedListingStatus; after: number | ManagedListingStatus; restored: boolean };
export type OperationSkip = { productId: string; productTitle: string; reason: string };
export type OperationHistoryRecord = { id: string; originalOperationId?: string; seller: string; storeId: string; actor: string; type: BulkOperationType | "rollback"; parameters: { value?: number; originalType?: BulkOperationType }; preparedAt: string; executedAt: string; status: OperationStatus; selectedIds: string[]; changes: OperationChange[]; skipped: OperationSkip[]; failed: OperationSkip[]; rollbackState: RollbackState };
export type RollbackAssessmentItem = { change: OperationChange; listing?: ManagedListing; current?: number | ManagedListingStatus; eligible: boolean; reason?: string };
export type RollbackAssessment = { operation: OperationHistoryRecord; eligible: RollbackAssessmentItem[]; excluded: RollbackAssessmentItem[]; assessedAt: string; snapshot: Record<string, string>; valid: boolean };
export type RollbackResult = { historyRecord: OperationHistoryRecord; restored: number; skipped: number; failed: number };
