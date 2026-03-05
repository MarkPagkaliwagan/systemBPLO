import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
  redirect("/components/sidebar");
  redirect("Admin/Inspection/management/analytics");
  redirect("Admin/Inspection/masterlist");
  redirect("Admin/Inspection/management/review");
  redirect("Admin/Compliance/");
  redirect("Admin/Compliance/Aging")
  
}