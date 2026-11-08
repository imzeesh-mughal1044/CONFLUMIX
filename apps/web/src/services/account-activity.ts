import type { AuthSession } from "@/lib/auth";
import type { AccountActivityEvent } from "@/types/account";
import { hasSavedProfile, readUserProfile } from "./account-profile";
import { readBuyerOrders } from "./orders";
import { readLocalReuseListings } from "./reuse";
import { readReuseOffers } from "./reuse-offers";
import { getProposalsBySolver, getTasksByOwner } from "./task-proposals";
import { readTaskWorkrooms } from "./task-workroom";

export function readAccountActivity(session:AuthSession):AccountActivityEvent[]{
  const email=session.email.toLowerCase(),events:AccountActivityEvent[]=[];
  for(const order of readBuyerOrders(session.email,session.fullName))for(const item of order.statusHistory)events.push({id:`order-${order.id}-${item.id}`,mode:"new-products",title:item.from?"Order status changed":"Order placed",detail:item.note||`Order ${order.reference} is ${item.to}.`,occurredAt:item.at,status:item.to,href:"/dashboard/new-products/orders",recordLabel:order.reference});
  for(const listing of readLocalReuseListings().filter(item=>item.ownerEmail?.toLowerCase()===email)){events.push({id:`reuse-listing-${listing.id}-${listing.updatedAt||listing.createdAt}`,mode:"reuse",title:listing.updatedAt?"Reuse listing updated":"Reuse listing created",detail:listing.title,occurredAt:listing.updatedAt||listing.createdAt,status:listing.lifecycle||"published",href:`/reuse/${listing.id}`,recordLabel:listing.title})}
  for(const offer of readReuseOffers().filter(item=>item.buyerEmail.toLowerCase()===email||item.sellerEmail?.toLowerCase()===email))for(const item of offer.history)events.push({id:`reuse-offer-${offer.id}-${item.id}`,mode:"reuse",title:item.kind==="counteroffer"?"Reuse counteroffer recorded":"Reuse offer submitted",detail:`${item.actorRole==="buyer"?"Buyer":"Seller"} recorded an offer of PKR ${item.amount.toLocaleString("en-PK")}.`,occurredAt:item.createdAt,status:offer.status,href:`/reuse/offers/${offer.id}`,recordLabel:offer.id});
  const tasks=getTasksByOwner(session.email,session.fullName);for(const task of tasks)events.push({id:`task-${task.id}-${"updatedAt" in task?task.updatedAt:task.createdAt}`,mode:"tasks",title:"Task activity",detail:task.title,occurredAt:"updatedAt" in task?task.updatedAt:task.createdAt,status:task.status,href:`/tasks/${task.id}`,recordLabel:task.title});
  for(const proposal of getProposalsBySolver(session.email))events.push({id:`proposal-${proposal.id}-${proposal.updatedAt}`,mode:"tasks",title:"Proposal activity",detail:proposal.latestUpdate,occurredAt:proposal.updatedAt,status:proposal.status,href:"/dashboard/tasks/proposals",recordLabel:proposal.id});
  const ownedIds=new Set(tasks.map(item=>item.id));for(const room of readTaskWorkrooms()){const proposal=getProposalsBySolver(session.email,true).find(item=>item.taskId===room.taskId);if(!ownedIds.has(room.taskId)&&!proposal)continue;for(const item of room.activity)events.push({id:`work-${room.taskId}-${item.id}`,mode:"tasks",title:"Task workroom activity",detail:item.detail,occurredAt:item.occurredAt,status:room.status,href:`/dashboard/tasks/work/${room.taskId}/history`,recordLabel:room.taskId})}
  if(hasSavedProfile(session)){const profile=readUserProfile(session);events.push({id:`account-profile-${profile.updatedAt}`,mode:"account",title:"Profile updated",detail:"Shared profile information was saved.",occurredAt:profile.updatedAt,status:profile.publicProfileEnabled?"Public profile enabled":"Private",href:"/account/profile",recordLabel:"My Profile"})}
  return events.filter(item=>item.occurredAt).sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt));
}
