import { SellerRouteGuard } from "@/components/seller/seller-route-guard";
export default function Layout({children}:{children:React.ReactNode}){return <SellerRouteGuard area="management">{children}</SellerRouteGuard>}
