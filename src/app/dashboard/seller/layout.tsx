import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/use-current-user";

export default async function SellerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Block non sellers from accessing the seller dashboard
  const user = await currentUser();
  if (!user || user.role !== "SELLER") redirect("/");

  return (
    <div className="w-full h-full">
      <div className="ml-[300px]">
        <div className="w-full mt-[75px] p-4">{children}</div>
      </div>
    </div>
  );
}
