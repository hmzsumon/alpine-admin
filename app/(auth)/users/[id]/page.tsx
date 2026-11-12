/* ────────── authenticated owner staff profile ────────── */
import StaffDetailsPage from "@/components/users/StaffDetailsPage";
export default function Page({params}:{params:{id:string}}){return <StaffDetailsPage id={params.id}/>;}
