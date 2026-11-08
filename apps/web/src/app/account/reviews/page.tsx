import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewsPage } from "@/components/account/reviews-page";
export const metadata:Metadata={title:"Reviews & Feedback"};
export default function Page(){return <Suspense fallback={null}><ReviewsPage/></Suspense>}
