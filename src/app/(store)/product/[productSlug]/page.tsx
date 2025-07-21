import StoreCard from "@/components/store/cards/store-card";
import Descriptions from "@/components/store/product-page/descriptions";
import ProductPageContainer from "@/components/store/product-page/info/container";
import { Questions } from "@/components/store/product-page/questions";
import RelatedProducts from "@/components/store/product-page/related-products";
import Specifications from "@/components/store/product-page/specifications";
import { Separator } from "@/components/ui/separator";
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
        <Separator className="mt-6" />

        <div className="h-6" />

        <StoreCard store={store} />

        <Separator />

        {/* related products */}
        <RelatedProducts
          productId={product.id}
          categoryId={product.categoryId}
          subCategoryId={product.subCategoryId}
        />
      </ProductPageContainer>
    </div>
  );
}
