import AddressContainer from "@/components/store/profile/addresses/container";
import { getUserShippingAddresses } from "@/queries/user";

export default async function ProfileAddressesPage() {
  const addresses = await getUserShippingAddresses();

  return (
    <div>
      <AddressContainer addresses={addresses} />
    </div>
  );
}
