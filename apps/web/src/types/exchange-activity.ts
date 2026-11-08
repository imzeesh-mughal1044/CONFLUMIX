export type ExchangeMode="new-products"|"reuse"|"tasks"|"donations";
export type ExchangeLifecycle="active"|"awaiting"|"completed"|"cancelled"|"unsuccessful";
export type ExchangeAction={label:string;href:string};
export type ExchangeEvent={id:string;recordId:string;mode:ExchangeMode;description:string;occurredAt:string;actor?:string;from?:string;to?:string;href:string};
export type ExchangeRecord={id:string;mode:ExchangeMode;type:string;title:string;image?:string;reference?:string;role:string;status:string;lifecycle:ExchangeLifecycle;occurredAt:string;otherParty?:string;detail?:string;latestEvent:string;recordHref:string;historyHref?:string;lifecycleHref?:string;nextAction?:ExchangeAction;events:ExchangeEvent[]};
export type ExchangeActivityResult={records:ExchangeRecord[];events:ExchangeEvent[];limitations:{mode:ExchangeMode;message:string}[]};
