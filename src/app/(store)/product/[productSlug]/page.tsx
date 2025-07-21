import StoreCard from "@/components/store/cards/store-card";
import ProductPageContainer from "@/components/store/product-page/info/container";
import RelatedProducts from "@/components/store/product-page/related-products";
import { Separator } from "@/components/ui/separator";
import { retrieveProductDetailsOptimized } from "@/queries/product";
import Reviews from "../../../../components/store/product-page/reviews";
import StoreProducts from "@/components/store/product-page/store-products";

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

        <StoreProducts
          storeUrl={product.store.url}
          storeName={product.store.name}
          count={5}
        />

        <Separator />

        <Separator className="mt-6" />

        <Reviews
          productId={product.id}
          rating={product.rating}
          variantsInfo={product.variants}
          numReviews={product._count.reviews}
        />

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
