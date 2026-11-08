import { donationClaimDemonstrations } from "@/data/donation-claims";
import { donationHandoverDemonstrations } from "@/data/donation-handovers";
import { donationNeeds, donationResources } from "@/data/donations";
import { buildDonationMatches, eligibleDonationNeeds, eligibleDonationResources, unmatchedDonationNeeds } from "@/services/donation-matching";

export function buildDonationDashboard(){
  const activeDonations=eligibleDonationResources();
  const activeNeeds=eligibleDonationNeeds();
  const matches=buildDonationMatches();
  const unmatchedNeeds=unmatchedDonationNeeds(matches);
  const pendingClaims=donationClaimDemonstrations.filter(claim=>claim.claimStatus==="pending");
  const reservedClaims=donationClaimDemonstrations.filter(claim=>claim.reservationStatus==="reserved");
  const completedHandovers=donationHandoverDemonstrations.filter(handover=>handover.status==="completed");
  const recentDonations=[...donationResources].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,5);
  const handovers=[...donationHandoverDemonstrations].sort((a,b)=>{
    const aDate=a.confirmedSchedule??a.proposedSchedule??a.activity.at(-1)?.at??"";
    const bDate=b.confirmedSchedule??b.proposedSchedule??b.activity.at(-1)?.at??"";
    return bDate.localeCompare(aDate)||a.id.localeCompare(b.id);
  });
  const urgentNeeds=activeNeeds.filter(need=>need.urgency==="urgent").sort((a,b)=>(a.neededBy??"9999").localeCompare(b.neededBy??"9999")||b.createdAt.localeCompare(a.createdAt));
  const completedQuantity=completedHandovers.reduce((sum,handover)=>sum+handover.quantity,0);
  const availableByCategory=Object.entries(activeDonations.reduce<Record<string,number>>((result,resource)=>{result[resource.category]=(result[resource.category]??0)+resource.availableQuantity;return result},{})).sort((a,b)=>b[1]-a[1]);
  const needsByCategory=Object.entries(activeNeeds.reduce<Record<string,number>>((result,need)=>{result[need.category]=(result[need.category]??0)+1;return result},{})).sort((a,b)=>b[1]-a[1]);
  return {metrics:{activeDonations:activeDonations.length,pendingClaims:pendingClaims.length,reservedResources:reservedClaims.length,completedHandovers:completedHandovers.length,activeNeeds:activeNeeds.length,unmatchedNeeds:unmatchedNeeds.length,estimatedValue:null,estimatedMaterial:null},activeDonations,activeNeeds,matches,unmatchedNeeds,pendingClaims,reservedClaims,completedHandovers,recentDonations,handovers,urgentNeeds,completedQuantity,availableByCategory,needsByCategory,totalResourceRecords:donationResources.length,totalNeedRecords:donationNeeds.length};
}
