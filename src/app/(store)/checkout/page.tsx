import CheckoutContainer from "@/components/store/checkout/container";
import { db } from "@/lib/db";
import { Country } from "@/lib/types";
import { currentUser } from "@/lib/use-current-user";
import { getUserShippingAddresses } from "@/queries/user";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const user = await currentUser();
  if (!user) redirect("/cart");

  const cart = await db.cart.findFirst({
    where: { userId: user.id },
    include: {
      items: true,
    },
  });

  if (!cart) redirect("/cart");

  const addresses = await getUserShippingAddresses();

  return (
    <div className="bg-[#f4f4f4] min-h-[calc(100vh-65px)]">
      <div className="max-w-container mx-auto py-4 px-2 ">
        <CheckoutContainer cart={cart} addresses={addresses} />
      </div>
    </div>
  );
}
