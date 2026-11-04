"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readAuthSession } from "@/lib/auth";
import { hasNewProductIntent, newProductOnboardingStage, readSellerOnboarding } from "@/services/seller-onboarding";

export function SellerRouteGuard({children,area}:{children:React.ReactNode;area:"onboarding"|"management"}){const pathname=usePathname(),router=useRouter(),[allowed,setAllowed]=useState(false);useEffect(()=>{let active=true;void readAuthSession().then((session)=>{if(!active)return;if(!session){router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);return}if(process.env.NODE_ENV==="development"&&pathname.endsWith("/test-data")){setAllowed(true);return}const record=readSellerOnboarding(session.email);if(!hasNewProductIntent(record)){router.replace("/become-a-seller");return}const stage=newProductOnboardingStage();if(pathname.includes("/new-products/categories")&&stage==="profile"){router.replace("/dashboard/seller-center/setup");return}if(area==="management"&&stage!=="complete"){router.replace(stage==="profile"?"/dashboard/seller-center/setup":"/dashboard/seller-center/new-products/categories");return}setAllowed(true)});return()=>{active=false}},[area,pathname,router]);return allowed?<>{children}</>:<div className="route-loading" role="status">Checking seller access…</div>}
