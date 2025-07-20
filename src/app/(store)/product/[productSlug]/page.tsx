import ProductPageContainer from "@/components/store/product-page/info/container";
import { Separator } from "@/components/ui/separator";
import { Country } from "@/lib/types";
import { retrieveProductDetailsOptimized } from "@/queries/product";

interface ProductVariantPageProps {
  params: {
    productSlug: string;
  };
  searchParams: {
    variant: string;
  };
}

export default async function ProductVariantPage({
  params,
  searchParams,
}: ProductVariantPageProps) {
  const product = await retrieveProductDetailsOptimized(params.productSlug);
  const variant = product.variants.find((v) => v.slug === searchParams.variant);

  const specs = {
    product: product.specs,
    variant: variant?.specs,
  };

  const store = {
    id: product.store.id,
    name: product.store.name,
    url: product.store.url,
    logo: product.store.logo,
    followersCount: 0,
    isUserFollowingStore: false,
  };

  return (
    <div className="max-w-[1650px] mx-auto p-4 overflow-x-hidden">
      <ProductPageContainer
        productData={product}
        variantSlug={searchParams.variant}
      >
        <div></div>
      </ProductPageContainer>
    </div>
  );
}
