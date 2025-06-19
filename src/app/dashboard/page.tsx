import { currentUser } from "@/lib/use-current-user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user?.role || user?.role === "USER") {
    redirect("/");
  }

  if (user.role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  if (user.role === "SELLER") {
    redirect("/dashboard/seller");
  }
}
