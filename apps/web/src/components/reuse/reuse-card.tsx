import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/public/icons";
import { SaveItemButton } from "@/components/account/save-item-button";
import type { ReuseListing } from "@/types/reuse";

const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });

export function ReuseCard({ listing }: { listing: ReuseListing }) {
  return <article className="reuse-card">
    <Link className="reuse-card__image" href={`/reuse/${listing.id}`} aria-label={`View ${listing.title}`}>
      {listing.image ? <Image src={listing.image} alt={`${listing.title}, demo listing`} fill sizes="(max-width: 767px) 50vw, 240px"/> : <span><Icon name="package" size={34}/><small>Image unavailable</small></span>}
      <b>Demo</b>
    </Link>
    <div className="reuse-card__body">
      <div className="reuse-card__meta"><span>{listing.condition}</span><span>{listing.status}</span></div>
      <h3><Link href={`/reuse/${listing.id}`}>{listing.title}</Link></h3>
      <div className="reuse-card__price"><strong>{money.format(listing.askingPrice)}</strong>{listing.previousAskingPrice && <del>{money.format(listing.previousAskingPrice)}</del>}</div>
      <p>{listing.category}</p><p>{listing.locality} · {listing.sellerType}</p>
      <SaveItemButton mode="reuse" itemId={listing.id} returnPath={`/reuse/${listing.id}`}/>
    </div>
  </article>;
}
