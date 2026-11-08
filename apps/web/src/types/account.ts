export type UserProfile = {
  email: string;
  fullName: string;
  displayName: string;
  locality: string;
  bio: string;
  phone: string;
  avatarUrl: string;
  publicProfileEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ActivityMode = "new-products" | "reuse" | "tasks" | "donations" | "handover" | "account";
export type AccountActivityEvent = { id:string; mode:ActivityMode; title:string; detail:string; occurredAt:string; status?:string; href?:string; recordLabel?:string };
export type AccountNotification = AccountActivityEvent & { read:boolean };
export type SavedItemMode = "new-products" | "reuse";
export type SavedItemRecord = { id:string; mode:SavedItemMode; itemId:string; savedAt:string };

