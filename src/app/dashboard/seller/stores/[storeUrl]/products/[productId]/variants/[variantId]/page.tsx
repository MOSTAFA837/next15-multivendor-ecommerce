import ProductDetails from "@/components/dashboard/forms/product-details";

// Queries
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
import { getProductVariant } from "@/queries/product";

export default async function ProductVariantPage({
  params,
}: {
  params: { storeUrl: string; productId: string; variantId: string };
}) {
  const categories = await getAllCategories();
  const offerTags = await getAllOfferTags();
  const { productId, variantId, storeUrl } = params;
  const productDetails = await getProductVariant(productId, variantId);
  if (!productDetails) return;

  console.log(productDetails);

  const newDetails = {
    ...productDetails,
    variantName: productDetails.variantName ?? "",
    variantDescription: productDetails.variantDescription ?? "",
    variantImage: productDetails.variantImage ?? "",
    colors: productDetails.colors.map((c) => ({
      color: c.name,
    })),
  };

  return (
    <div>
      <ProductDetails
        categories={categories}
        offerTags={offerTags}
        storeUrl={storeUrl}
        data={newDetails}
      />
    </div>
  );
}
