import { ReactNode } from "react";
import { redirect } from "next/navigation";

// Custom UI Components
import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/sidebar";

import { currentUser } from "@/lib/use-current-user";

// DB
import { db } from "@/lib/db";

export default async function SellerStoreDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Fetch the current user. If the user is not authenticated, redirect them to the home page.
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  // Retrieve the list of stores associated with the authenticated user.
  const stores = await db.store.findMany({
    where: {
      userId: user.id,
    },
  });

  return (
    <div className="h-full w-full flex">
      <Sidebar stores={stores} />

      <div className="w-full lg:ml-[300px]">
        <Header />
        <div className="w-full mt-[75px] p-4">{children}</div>
      </div>
    </div>
  );
}
