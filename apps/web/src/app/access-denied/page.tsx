import type {Metadata} from "next";
import {SystemStatePage} from "@/components/system/system-state-page";
export const metadata:Metadata={title:"Access Denied",robots:{index:false,follow:false}};
export default function Page(){return <SystemStatePage kind="access-denied"/>}
