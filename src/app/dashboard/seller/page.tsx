import { db } from "@/lib/db";
import { currentUser } from "@/lib/use-current-user";
import { redirect } from "next/navigation";

export default async function SellerDashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const stores = await db.store.findMany({
    where: {
      userId: user.id,
    },
  });

  console.log(stores);

  // If the user has no stores, redirect them to the page for creating a new store.
  if (stores.length === 0) {
    redirect("/dashboard/seller/stores/new");
  }

  // If the user has stores, redirect them to the dashboard of their first store.
  redirect(`/dashboard/seller/stores/${stores[0].url}`);
}
