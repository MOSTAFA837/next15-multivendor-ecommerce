import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/use-current-user";
import Sidebar from "@/components/dashboard/sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Block non admins from accessing the admin dashboard
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  return (
    <div className="w-full h-full">
      <Sidebar isAdmin />

      <div className="">
        <div className="w-full mt-[25px]">{children}</div>
      </div>
    </div>
  );
}
