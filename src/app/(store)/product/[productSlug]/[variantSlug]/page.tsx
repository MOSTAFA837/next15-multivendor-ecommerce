import ProductPageContainer from "@/components/store/product-page/info/container";
import { getProductPageData } from "@/queries/product";
import { notFound } from "next/navigation";

interface ProductVariantPageProps {
  params: {
    productSlug: string;
    variantSlug: string;
  };
  searchParams: {
    size?: string;
  };
}

export default async function ProductVariantPage({
  params: { productSlug, variantSlug },
  searchParams: { size: sizeId },
}: ProductVariantPageProps) {
  const product = await getProductPageData(productSlug, variantSlug);

  if (!product) return notFound();

  return (
    <div className="max-w-[1650px] mx-auto p-4 overflow-x-hidden">
      <ProductPageContainer
        productData={product}
        sizeId={sizeId}
        variantSlug={variantSlug}
      >
        <div></div>
      </ProductPageContainer>
    </div>
  );
}
