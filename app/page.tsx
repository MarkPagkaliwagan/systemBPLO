import { redirect } from "next/navigation";

export default function Home() {
  redirect("/module-2-inspection/login");
  redirect("/module-2-inspection/components/sidebar");
  redirect("/module-2-inspection/management/analytics");
  redirect("/module-2-inspection/management/analytics/masterlist");
}