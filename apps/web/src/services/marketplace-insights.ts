import {donationNeeds,donationResources} from "@/data/donations";
import {donationCategoryLabel} from "@/services/donations";
import {eligibleDonationNeeds,eligibleDonationResources,unmatchedDonationNeeds} from "@/services/donation-matching";
import {readPublicProducts} from "@/services/products";
import {allReuseListings} from "@/services/reuse";
import {browseTasks,isOpenTask} from "@/services/tasks";
import type {InsightFilters,InsightRecord} from "@/types/marketplace-insights";

export const modeLabels={"new-products":"New Products",reuse:"Reuse",tasks:"Tasks",donations:"Donations"} as const;

export function readInsightRecords():InsightRecord[]{
  const products=readPublicProducts().filter(item=>item.stock>0).map(item=>({id:item.id,mode:"new-products",kind:"supply",category:item.category,locality:item.locality,createdAt:item.createdAt,label:item.title,units:item.stock} as const));
  const reuse=allReuseListings().filter(item=>(item.lifecycle??"published")==="published"&&item.status==="Active"&&item.availability==="Available").map(item=>({id:item.id,mode:"reuse",kind:"supply",category:item.category,locality:item.locality,createdAt:item.createdAt,label:item.title,units:item.quantity??1,classification:item.classification} as const));
  const tasks=browseTasks({sort:"newest"}).filter(isOpenTask).map(item=>({id:item.id,mode:"tasks",kind:"demand",category:item.category,locality:item.locality,createdAt:item.createdAt,label:item.title,skills:item.skills} as const));
  const resources=eligibleDonationResources().map(item=>({id:item.id,mode:"donations",kind:"supply",category:donationCategoryLabel(item.category),locality:item.locality,createdAt:item.createdAt,label:item.title,units:item.availableQuantity} as const));
  const needs=eligibleDonationNeeds().map(item=>({id:item.id,mode:"donations",kind:"demand",category:donationCategoryLabel(item.category),locality:item.locality,createdAt:item.createdAt,label:item.title,units:item.quantity} as const));
  return[...products,...reuse,...tasks,...resources,...needs];
}

export function filterInsightRecords(records:InsightRecord[],filters:InsightFilters){
  const now=new Date(),start=filters.range==="custom"&&filters.start?new Date(`${filters.start}T00:00:00`):filters.range==="year"?new Date(now.getFullYear(),0,1):new Date(now.getTime()-Number(filters.range)*86400000);
  const end=filters.range==="custom"&&filters.end?new Date(`${filters.end}T23:59:59`):now;
  return records.filter(record=>(filters.mode==="all"||record.mode===filters.mode)&&(!filters.category||`${record.mode}|${record.category}`===filters.category)&&(!filters.locality||record.locality===filters.locality)&&new Date(record.createdAt)>=start&&new Date(record.createdAt)<=end);
}
export function donationUnmatchedIds(){return new Set(unmatchedDonationNeeds().map(item=>item.id))}
export const donationFixtureCount=donationResources.length+donationNeeds.length;
