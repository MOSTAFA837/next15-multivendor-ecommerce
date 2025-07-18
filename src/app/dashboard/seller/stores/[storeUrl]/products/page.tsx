import { getAllCategories } from "@/queries/category";
import { getAllStoreProducts } from "@/queries/product";
import React from "react";
import DataTable from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import ProductDetails from "@/components/dashboard/forms/product-details";
import { columns } from "./columns";
import { updateVariantImage } from "@/scripts/variant-image";
import { getAllOfferTags } from "@/queries/offer-tag";

export default async function SellerProductsPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  // Fetching products data from the database for the active store
  const products = await getAllStoreProducts(params.storeUrl);

  const categories = await getAllCategories();
  const offerTags = await getAllOfferTags();

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create product
        </>
      }
      modalChildren={
        <ProductDetails
          categories={categories || []}
          storeUrl={params.storeUrl}
          offerTags={offerTags || []}
        />
      }
      newTabLink={`/dashboard/seller/stores/${params.storeUrl}/products/new`}
      filterValue="name"
      data={products}
      columns={columns}
      searchPlaceholder="Search product name..."
    />
  );
}
