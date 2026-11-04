import type { OrderRecord,ReturnReason } from "./orders";
export type ReturnPeriod="7"|"30"|"90"|"year"|"all";
export type ReturnRecord={requestId:string;orderId:string;orderReference:string;productId:string;productTitle:string;productImage:string;sku?:string;category:string;quantity:number;reason:ReturnReason|"Unclassified";rawReason?:string;status:"requested"|"approved"|"rejected"|"completed";requestedAt:string;order:OrderRecord};
export type ReturnAggregate={key:string;requests:number;quantity:number;topReason:string;productId?:string;image?:string;sku?:string};
export type ReturnAlert={id:string;title:string;subject:string;reason:string;count:number;evidence:string;recommendation:string;productId:string};
export type ReturnAnalysis={records:ReturnRecord[];categorizedCount:number;unclassifiedCount:number;reasonCounts:{reason:string;count:number;share:number|null}[];products:ReturnAggregate[];categories:ReturnAggregate[];alerts:ReturnAlert[];trend:{period:string;count:number}[];trendSufficient:boolean;metrics:{total:number;open:number;approved:number;rejected:number;completed:number;quantity:number};eligibleCompletedOrders:number;orderReturnRate:number|null};
