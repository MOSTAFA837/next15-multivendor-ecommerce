import StoreShippingDetails from "@/components/dashboard/forms/store-shipping-details";
import DataTable from "@/components/ui/data-table";
import {
  getStoreDefaultShippingDetails,
  getStoreShippingRates,
} from "@/queries/store";
import { columns } from "./columns";

async function SellerStoreShippingPage({
  params,
}: {
  params: { storeUrl?: string };
}) {
  const storeUrl = params?.storeUrl;
  if (!storeUrl) return null;

  const shippingDetails = await getStoreDefaultShippingDetails(storeUrl);
  const shippingRates = await getStoreShippingRates(storeUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-form-accent via-background to-form p-6 w-full">
      <div className="mx-auto">
        <StoreShippingDetails
          data={shippingDetails}
          storeUrl={params.storeUrl!}
        />

        <DataTable
          filterValue="countryName"
          data={shippingRates}
          columns={columns}
          searchPlaceholder="Search by country name..."
        />
      </div>
    </div>
  );
}

export default SellerStoreShippingPage;
