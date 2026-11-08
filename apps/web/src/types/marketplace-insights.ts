export type InsightMode="all"|"new-products"|"reuse"|"tasks"|"donations"|"cross";
export type InsightRecord={id:string;mode:Exclude<InsightMode,"all"|"cross">;kind:"supply"|"demand";category:string;locality:string;createdAt:string;label:string;units?:number;classification?:string;skills?:string[]};
export type InsightFilters={mode:InsightMode;range:"7"|"30"|"90"|"year"|"custom";category:string;locality:string;start:string;end:string};
