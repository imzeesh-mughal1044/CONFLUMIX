"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { donationClaimDemonstrations } from "@/data/donation-claims";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import { findDonationResource } from "@/services/donations";
import type { DonationManagedClaim } from "@/types/donations";
import { PublicShell } from "@/components/public/public-shell";

type StatusFilter = "all" | "pending" | "approved" | "reserved" | "rejected" | "completed";
type ReviewAction = "approve" | "reject" | "reserve" | "schedule";
const dateFormat = new Intl.DateTimeFormat("en-PK", { day:"numeric",month:"short",year:"numeric" });
const statusOptions: Array<[StatusFilter,string]> = [["all","All claims"],["pending","Pending review"],["approved","Approved"],["reserved","Reserved"],["rejected","Rejected"],["completed","Completed handover"]];

function matchesStatus(claim: DonationManagedClaim, status: StatusFilter) {
  if (status === "all") return true;
  if (status === "reserved") return claim.reservationStatus === "reserved";
  if (status === "completed") return claim.handoverStatus === "completed";
  return claim.claimStatus === status;
}

function primaryStatus(claim: DonationManagedClaim) {
  if (claim.handoverStatus === "completed") return "Completed handover";
  if (claim.handoverStatus === "scheduled") return "Handover scheduled";
  if (claim.reservationStatus === "reserved") return "Resource reserved";
  if (claim.claimStatus === "pending") return "Pending review";
  return claim.claimStatus === "approved" ? "Approved" : "Rejected";
}

export function DonationClaimsManagement() {
  const router = useRouter();
  const detailDialog = useRef<HTMLDialogElement>(null);
  const actionDialog = useRef<HTMLDialogElement>(null);
  const [session,setSession] = useState<AuthSession|null|undefined>();
  const [query,setQuery] = useState("");
  const [status,setStatus] = useState<StatusFilter>("all");
  const [requesterType,setRequesterType] = useState("all");
  const [reservation,setReservation] = useState("all");
  const [handover,setHandover] = useState("all");
  const [sort,setSort] = useState("newest");
  const [limit,setLimit] = useState(5);
  const [selected,setSelected] = useState<DonationManagedClaim|null>(null);
  const [pendingAction,setPendingAction] = useState<ReviewAction|null>(null);
  const [rejectionReason,setRejectionReason] = useState("");
  const [notice,setNotice] = useState("");

  useEffect(()=>{let active=true;void readAuthSession().then(current=>{if(!active)return;if(!current){router.replace("/auth/login?next=%2Fdashboard%2Fdonations%2Fclaims");return}setSession(current)});return()=>{active=false}},[router]);

  const counts = useMemo(()=>({
    pending:donationClaimDemonstrations.filter(claim=>claim.claimStatus==="pending").length,
    approved:donationClaimDemonstrations.filter(claim=>claim.claimStatus==="approved").length,
    reserved:donationClaimDemonstrations.filter(claim=>claim.reservationStatus==="reserved").length,
    rejected:donationClaimDemonstrations.filter(claim=>claim.claimStatus==="rejected").length,
    completed:donationClaimDemonstrations.filter(claim=>claim.handoverStatus==="completed").length,
  }),[]);

  const filtered = useMemo(()=>{
    const term=query.trim().toLocaleLowerCase();
    const result=donationClaimDemonstrations.filter(claim=>{
      const resource=findDonationResource(claim.resourceId);
      const searchable=[claim.id,claim.requesterName,claim.intendedUse,resource?.title??""].join(" ").toLocaleLowerCase();
      return (!term||searchable.includes(term))&&matchesStatus(claim,status)&&(requesterType==="all"||claim.requesterType===requesterType)&&(reservation==="all"||claim.reservationStatus===reservation)&&(handover==="all"||claim.handoverStatus===handover);
    });
    return [...result].sort((a,b)=>sort==="oldest"?a.submittedAt.localeCompare(b.submittedAt):sort==="quantity"?b.requestedQuantity-a.requestedQuantity:sort==="status"?primaryStatus(a).localeCompare(primaryStatus(b)):b.submittedAt.localeCompare(a.submittedAt));
  },[query,status,requesterType,reservation,handover,sort]);

  const clearFilters=()=>{setQuery("");setStatus("all");setRequesterType("all");setReservation("all");setHandover("all");setSort("newest");setLimit(5)};
  const viewClaim=(claim:DonationManagedClaim)=>{setSelected(claim);setNotice("");detailDialog.current?.showModal()};
  const requestAction=(claim:DonationManagedClaim,action:ReviewAction)=>{setSelected(claim);setPendingAction(action);setNotice("");setRejectionReason("");actionDialog.current?.showModal()};
  const confirmAction=()=>{
    if(!selected||!pendingAction)return;
    if(pendingAction==="reject"&&rejectionReason.trim().length<10){setNotice("Provide at least 10 characters so a future rejection can be reviewed fairly.");return}
    setNotice(`${pendingAction[0].toUpperCase()+pendingAction.slice(1)} is unavailable: reviewer authorization and the required backend endpoint are not connected. No status, inventory, reservation, audit record, or handover was changed.`);
  };
  const activeFilters=query||status!=="all"||requesterType!=="all"||reservation!=="all"||handover!=="all";

  if(!session)return <PublicShell><div className="donation-admin-loading page-container" role="status"><span>Loading authorized claim workspace…</span></div></PublicShell>;

  return <PublicShell><div className="donation-admin"><div className="page-container">
    <nav className="donation-admin__nav" aria-label="Donation management"><Link href="/dashboard">Dashboard</Link><Link href="/donations/resources">Donation resources</Link><Link href="/donations/new">Donate a resource</Link><Link href="/dashboard/donations/matching">Matching</Link><span aria-current="page">Claims</span></nav>
    <header className="donation-admin__header"><div><p className="section-kicker">DON-09 · Donation operations</p><h1>Manage donation claims</h1><p>Review claim context while keeping decisions, reservations, and handovers visibly separate.</p></div><Link className="button button--secondary" href="/donations/resources">View public resources</Link></header>
    <div className="donation-admin__boundary"><strong>Demonstration workspace</strong><p>These records are fictional interface examples. Your signed-in identity is not linked to donor ownership or an allocator role, so no production claim data is exposed and no management action can be persisted.</p></div>
    <section className="donation-admin__summary" aria-label="Filter demonstration claims by status">
      <Summary label="Pending claims" value={counts.pending} context="Awaiting review" active={status==="pending"} onClick={()=>setStatus("pending")}/>
      <Summary label="Approved claims" value={counts.approved} context="Not necessarily reserved" active={status==="approved"} onClick={()=>setStatus("approved")}/>
      <Summary label="Reserved resources" value={counts.reserved} context="Claim records, not units" active={status==="reserved"} onClick={()=>setStatus("reserved")}/>
      <Summary label="Rejected claims" value={counts.rejected} context="Decision examples" active={status==="rejected"} onClick={()=>setStatus("rejected")}/>
      <Summary label="Completed handovers" value={counts.completed} context="Fictional lifecycle example" active={status==="completed"} onClick={()=>setStatus("completed")}/>
    </section>
    <section className="donation-admin__controls" aria-label="Claim search and filters">
      <label className="donation-admin__search"><span>Search claims</span><input type="search" value={query} onChange={event=>{setQuery(event.target.value);setLimit(5)}} placeholder="Resource, requester, reference, or intended use"/></label>
      <label><span>Status</span><select value={status} onChange={event=>{setStatus(event.target.value as StatusFilter);setLimit(5)}}>{statusOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label><span>Requester</span><select value={requesterType} onChange={event=>setRequesterType(event.target.value)}><option value="all">All requester types</option><option>Individual</option><option>Organization</option></select></label>
      <label><span>Reservation</span><select value={reservation} onChange={event=>setReservation(event.target.value)}><option value="all">All reservation states</option><option value="not-reserved">Not reserved</option><option value="reserved">Reserved</option></select></label>
      <label><span>Handover</span><select value={handover} onChange={event=>setHandover(event.target.value)}><option value="all">All handover states</option><option value="not-scheduled">Not scheduled</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option></select></label>
      <label><span>Sort</span><select value={sort} onChange={event=>setSort(event.target.value)}><option value="newest">Newest claims</option><option value="oldest">Oldest claims</option><option value="quantity">Requested quantity</option><option value="status">Status</option></select></label>
      {activeFilters&&<button className="button button--quiet" type="button" onClick={clearFilters}>Clear filters</button>}
    </section>
    <div className="donation-admin__result"><p><strong>{filtered.length}</strong> of {donationClaimDemonstrations.length} demonstration claims</p><span>Showing {Math.min(limit,filtered.length)}</span></div>
    {filtered.length===0?<section className="donation-admin__empty"><h2>No claims match these filters</h2><p>Clear the active filters to return to the full demonstration set.</p><button className="button button--secondary" type="button" onClick={clearFilters}>Clear filters</button></section>:<section className="donation-admin__list" aria-label="Donation claims"><div className="donation-admin__table" role="region" tabIndex={0}><table><thead><tr><th>Resource</th><th>Requester</th><th>Requested quantity</th><th>Need or intended use</th><th>Claim date</th><th>Status</th><th>Available actions</th></tr></thead><tbody>{filtered.slice(0,limit).map(claim=><ClaimRow key={claim.id} claim={claim} onView={viewClaim} onAction={requestAction}/>)}</tbody></table></div><div className="donation-admin__cards">{filtered.slice(0,limit).map(claim=><ClaimCard key={claim.id} claim={claim} onView={viewClaim} onAction={requestAction}/>)}</div>{limit<filtered.length&&<button className="button button--secondary donation-admin__more" type="button" onClick={()=>setLimit(value=>value+5)}>Load more claims</button>}</section>}
  </div></div>
  <ClaimDetailDialog dialogRef={detailDialog} claim={selected}/>
  <dialog ref={actionDialog} className="donation-admin__dialog" onClose={()=>{setPendingAction(null);setNotice("")}}>{selected&&pendingAction&&<><p className="section-kicker">Demonstration action</p><h2>{actionTitle(pendingAction)}</h2><dl><div><dt>Resource</dt><dd>{findDonationResource(selected.resourceId)?.title??"Resource unavailable"}</dd></div><div><dt>Requester</dt><dd>{selected.requesterName}</dd></div><div><dt>Claim reference</dt><dd>{selected.id}</dd></div><div><dt>Requested quantity</dt><dd>{selected.requestedQuantity} {findDonationResource(selected.resourceId)?.unit??"units"}</dd></div></dl><p>{actionConsequence(pendingAction,selected)}</p>{pendingAction==="reject"&&<label><span>Rejection reason *</span><textarea rows={3} value={rejectionReason} onChange={event=>setRejectionReason(event.target.value)}/></label>}{notice&&<div className="donation-admin__action-notice" role="alert">{notice}</div>}<div className="donation-admin__dialog-actions"><button className="button button--secondary" type="button" onClick={()=>actionDialog.current?.close()}>Cancel</button><button className={pendingAction==="reject"?"button button--danger":"button button--primary"} type="button" onClick={confirmAction}>Confirm {pendingAction}</button></div></>}</dialog>
  </PublicShell>;
}

function Summary({label,value,context,active,onClick}:{label:string;value:number;context:string;active:boolean;onClick:()=>void}){return <button type="button" className={active?"is-active":""} aria-pressed={active} onClick={onClick}><span>{label}</span><strong>{value}</strong><small>{context}</small></button>}

function ClaimActions({claim,onView,onAction}:{claim:DonationManagedClaim;onView:(claim:DonationManagedClaim)=>void;onAction:(claim:DonationManagedClaim,action:ReviewAction)=>void}){
  const resource=findDonationResource(claim.resourceId);const enough=Boolean(resource&&claim.requestedQuantity<=resource.availableQuantity);
  return <div className="donation-admin__actions"><button type="button" onClick={()=>onView(claim)}>View claim</button>{claim.claimStatus==="pending"&&<><button type="button" disabled={!enough} title={!enough?"Requested quantity exceeds recorded availability":undefined} onClick={()=>onAction(claim,"approve")}>Approve</button><button type="button" onClick={()=>onAction(claim,"reject")}>Reject</button></>}{claim.claimStatus==="approved"&&claim.reservationStatus==="not-reserved"&&<button type="button" disabled={!enough} onClick={()=>onAction(claim,"reserve")}>Reserve resource</button>}{claim.id==="CLM-DEMO-1038"&&claim.reservationStatus==="reserved"&&claim.handoverStatus==="not-scheduled"&&<Link href="/dashboard/donations/handover/HND-DEMO-2001">Schedule handover</Link>}</div>;
}

function ClaimRow({claim,onView,onAction}:{claim:DonationManagedClaim;onView:(claim:DonationManagedClaim)=>void;onAction:(claim:DonationManagedClaim,action:ReviewAction)=>void}){const resource=findDonationResource(claim.resourceId);return <tr><th scope="row"><div className="donation-admin__resource"><span>{resource&&<Image src={resource.image} alt="" fill sizes="48px"/>}</span><div><Link href={`/donations/resources/${claim.resourceId}`}>{resource?.title??"Unavailable resource"}</Link><small>{claim.resourceId} · {resource?.availability??"unknown"}</small></div></div></th><td><strong>{claim.requesterName}</strong><small>{claim.requesterType} · {claim.requesterVerification}</small></td><td>{claim.requestedQuantity} {resource?.unit??"units"}<small>Available: {resource?.availableQuantity??"Unknown"}</small></td><td><p className="donation-admin__excerpt">{claim.intendedUse}</p>{claim.reviewFlag&&<small className="donation-admin__flag">Review required: {claim.reviewFlag}</small>}</td><td>{dateFormat.format(new Date(claim.submittedAt))}<small>{claim.id}</small></td><td><StatusStack claim={claim}/></td><td><ClaimActions claim={claim} onView={onView} onAction={onAction}/></td></tr>}

function ClaimCard({claim,onView,onAction}:{claim:DonationManagedClaim;onView:(claim:DonationManagedClaim)=>void;onAction:(claim:DonationManagedClaim,action:ReviewAction)=>void}){const resource=findDonationResource(claim.resourceId);return <article><div className="donation-admin__card-head"><div><small>{claim.id}</small><h2>{resource?.title??"Unavailable resource"}</h2></div><StatusStack claim={claim}/></div><dl><div><dt>Requester</dt><dd>{claim.requesterName} · {claim.requesterType}</dd></div><div><dt>Requested</dt><dd>{claim.requestedQuantity} {resource?.unit??"units"} · {resource?.availableQuantity??"Unknown"} available</dd></div><div><dt>Claim date</dt><dd>{dateFormat.format(new Date(claim.submittedAt))}</dd></div><div><dt>Intended use</dt><dd>{claim.intendedUse}</dd></div></dl>{claim.reviewFlag&&<p className="donation-admin__flag">Review required: {claim.reviewFlag}</p>}<ClaimActions claim={claim} onView={onView} onAction={onAction}/></article>}

function StatusStack({claim}:{claim:DonationManagedClaim}){return <div className="donation-admin__statuses"><strong>{primaryStatus(claim)}</strong><small>Claim: {claim.claimStatus}</small><small>Reservation: {claim.reservationStatus}</small><small>Handover: {claim.handoverStatus}</small></div>}

function ClaimDetailDialog({dialogRef,claim}:{dialogRef:React.RefObject<HTMLDialogElement|null>;claim:DonationManagedClaim|null}){const resource=claim?findDonationResource(claim.resourceId):undefined;return <dialog ref={dialogRef} className="donation-admin__drawer" onClick={event=>{if(event.currentTarget===event.target)dialogRef.current?.close()}}>{claim&&<><header><div><p className="section-kicker">Claim details · Demonstration record</p><h2>{claim.id}</h2></div><button type="button" aria-label="Close claim details" onClick={()=>dialogRef.current?.close()}>×</button></header><div className="donation-admin__drawer-resource"><span>{resource&&<Image src={resource.image} alt={`${resource.title} resource`} fill sizes="120px"/>}</span><div><h3>{resource?.title??"Resource unavailable"}</h3><Link href={`/donations/resources/${claim.resourceId}`}>View public resource</Link></div></div><StatusStack claim={claim}/><dl><div><dt>Requester</dt><dd>{claim.requesterName} · {claim.requesterType}</dd></div><div><dt>Verification</dt><dd>{claim.requesterVerification}</dd></div><div><dt>Requested quantity</dt><dd>{claim.requestedQuantity} {resource?.unit??"units"}</dd></div><div><dt>Recorded availability</dt><dd>{resource?.availableQuantity??"Unknown"} {resource?.unit??"units"}</dd></div><div><dt>Claim date</dt><dd>{dateFormat.format(new Date(claim.submittedAt))}</dd></div><div><dt>Handover preference</dt><dd>{claim.handoverPreference}</dd></div><div><dt>Intended use</dt><dd>{claim.intendedUse}</dd></div><div><dt>Supporting information</dt><dd>{claim.supportingInformation??"Not provided"}</dd></div></dl>{claim.reviewFlag&&<div className="donation-admin__flag">Review required: {claim.reviewFlag}</div>}<section className="donation-admin__history"><h3>Decision history</h3><ol>{claim.decisionHistory.map(item=><li key={`${item.label}-${item.at}`}><time dateTime={item.at}>{dateFormat.format(new Date(item.at))}</time><div><strong>{item.label}</strong><span>{item.actor}</span><p>{item.detail}</p></div></li>)}</ol><small>This timeline is fictional demonstration data and is not an audit record.</small></section></>}</dialog>}

function actionTitle(action:ReviewAction){return action==="approve"?"Approve this claim?":action==="reject"?"Reject this claim?":action==="reserve"?"Reserve this resource?":"Schedule handover?"}
function actionConsequence(action:ReviewAction,claim:DonationManagedClaim){const resource=findDonationResource(claim.resourceId);if(action==="approve")return `Approval would change only the claim review state. It would not automatically reserve the requested ${claim.requestedQuantity} ${resource?.unit??"units"}.`;if(action==="reject")return "Rejection would close the ordinary pending-review path while preserving an authorized decision record.";if(action==="reserve")return `A backend transaction would need to verify and atomically reserve ${claim.requestedQuantity} of the recorded ${resource?.availableQuantity??"unknown"} available ${resource?.unit??"units"}.`;return "Scheduling would begin a separate handover workflow. It would not mark the handover completed."}
