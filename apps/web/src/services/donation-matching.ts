import { donationNeeds, donationResources } from "@/data/donations";
import type { DonationCompatibility, DonationNeed, DonationPotentialMatch, DonationResource } from "@/types/donations";

const normalize=(value:string)=>value.toLocaleLowerCase().replaceAll(/[^a-z0-9]+/g," ").trim();
const words=(value:string)=>new Set(normalize(value).split(" ").filter(word=>word.length>2));
const comparableLabels:Record<string,string[]>={
  "education-books":["material type","subject","educational level","reader level"],
  "clothing-bedding":["item type","size"],
  "food-essentials":["item type","packaging","storage"],
  "furniture-home":["item type","size constraint","dimensions"],
  "electronics-laptops":["device type","minimum function","functional condition","accessories","included accessories"],
  "medical-mobility":["equipment type","suitability","functional report"],
  "other-resources":["resource type","intended use"],
};

export const eligibleDonationNeeds=()=>donationNeeds.filter(need=>need.status==="open"||need.status==="partially-matched");
export const eligibleDonationResources=()=>donationResources.filter(resource=>resource.availableQuantity>0&&(resource.availability==="available"||resource.availability==="limited"));

function categoryCompatibility(resource:DonationResource,need:DonationNeed):{value:DonationCompatibility;notes:string[]}{
  if(resource.category!==need.category)return{value:"incompatible",notes:["The records use different donation categories."]};
  const labels=comparableLabels[need.category]??[];
  const relevantResource=resource.categoryAttributes.filter(item=>labels.includes(normalize(item.label)));
  const relevantNeed=need.categoryAttributes.filter(item=>labels.includes(normalize(item.label)));
  if(!relevantResource.length||!relevantNeed.length)return{value:"requires-review",notes:["Category-specific attributes are incomplete and require human review."]};
  let compared=0,aligned=0;
  for(const needAttribute of relevantNeed){
    const candidate=relevantResource.find(item=>normalize(item.label)===normalize(needAttribute.label))??relevantResource.find(item=>normalize(item.label).includes("accessor")&&normalize(needAttribute.label).includes("accessor"));
    if(!candidate)continue;
    compared++;
    const needWords=words(needAttribute.value),resourceWords=words(candidate.value);
    if([...needWords].some(word=>resourceWords.has(word)))aligned++;
  }
  if(compared&&aligned===compared)return{value:"compatible",notes:[]};
  return{value:"requires-review",notes:[compared?"Some recorded category attributes do not align exactly.":"No directly comparable category-specific attributes were found."]};
}

function localityCompatibility(resource:DonationResource,need:DonationNeed):DonationCompatibility{return !resource.locality||!need.locality?"unknown":normalize(resource.locality)===normalize(need.locality)?"compatible":"requires-review"}
function handoverCompatibility(resource:DonationResource,need:DonationNeed):DonationCompatibility{
  if(!resource.handoverMethod||!need.handoverRequirement)return"unknown";
  const resourceWords=words(resource.handoverMethod),needWords=words(need.handoverRequirement);
  return [...resourceWords].some(word=>needWords.has(word))?"compatible":"requires-review";
}

export function evaluateDonationMatch(resource:DonationResource,need:DonationNeed):DonationPotentialMatch|null{
  if(!eligibleDonationResources().some(item=>item.id===resource.id)||!eligibleDonationNeeds().some(item=>item.id===need.id)||resource.category!==need.category)return null;
  const category=categoryCompatibility(resource,need);
  const potentialQuantity=Math.min(resource.availableQuantity,need.quantity);
  if(potentialQuantity<=0)return null;
  const quantityCoverage=potentialQuantity>=need.quantity?"full":"partial";
  const locality=localityCompatibility(resource,need),handover=handoverCompatibility(resource,need);
  const notes=[...category.notes];
  if(locality!=="compatible")notes.push(locality==="unknown"?"Locality information is incomplete.":"Different localities require coordination; no distance or delivery is assumed.");
  if(handover!=="compatible")notes.push(handover==="unknown"?"Handover requirements are incomplete.":"Recorded handover wording differs and requires participant coordination.");
  const quantityText=quantityCoverage==="full"?`${potentialQuantity} ${resource.unit} could cover the recorded need.`:`${potentialQuantity} ${resource.unit} are available against a need for ${need.quantity}; this is only potential partial coverage.`;
  const categoryText=category.value==="compatible"?"Recorded category details align.":"The broad category matches, but category-specific details require review.";
  const localityText=locality==="compatible"?"Both records share the same documented locality.":"The locality records do not establish direct compatibility.";
  return{id:`${need.id}--${resource.id}`,resource,need,categoryCompatibility:category.value,quantityCoverage,localityCompatibility:locality,handoverCompatibility:handover,potentialQuantity,remainingQuantity:need.quantity,explanation:`${categoryText} ${quantityText} ${localityText}`,reviewNotes:notes};
}

export function buildDonationMatches():DonationPotentialMatch[]{
  const matches:DonationPotentialMatch[]=[];
  for(const need of eligibleDonationNeeds())for(const resource of eligibleDonationResources()){const match=evaluateDonationMatch(resource,need);if(match)matches.push(match)}
  return matches.sort((a,b)=>(a.need.urgency==="urgent"?0:1)-(b.need.urgency==="urgent"?0:1)||(a.quantityCoverage==="full"?0:1)-(b.quantityCoverage==="full"?0:1)||b.need.createdAt.localeCompare(a.need.createdAt)||a.id.localeCompare(b.id));
}

export function unmatchedDonationNeeds(matches=buildDonationMatches()){const matched=new Set(matches.map(match=>match.need.id));return eligibleDonationNeeds().filter(need=>!matched.has(need.id))}
