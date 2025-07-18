import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/use-current-user";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header/header";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Block non admins from accessing the admin dashboard
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  return (
    <div className="w-full h-full flex">
      <Sidebar isAdmin />

      <div className="w-full lg:ml-[300px]">
        <Header isAdmin />
        <div className="w-full mt-[75px] p-4">{children}</div>
      </div>
    </div>
  );
}
