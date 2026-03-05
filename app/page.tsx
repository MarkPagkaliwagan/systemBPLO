import { redirect } from "next/navigation";

export default function Home() {
  redirect("Admin/module-2-inspection/login");
  redirect("Admin/module-2-inspection/components/sidebar");
  redirect("Admin/module-2-inspection/management/analytics");
  redirect("Admin/module-2-inspection/management/analytics/masterlist");
  redirect("Admin/module-2-inspection/management/analytics/review");
  redirect("Admin/module-3-notice/Dashboard");
  redirect("Admin/module-3-notice/Aging")
  
}