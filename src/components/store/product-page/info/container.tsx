"use client";

import {
  ProductDataType,
  ProductPageDataType,
  ProductVariantDataType,
} from "@/lib/types";
import { ReactNode, useEffect, useState } from "react";
import ProductInfo from "./info";
import ProductSwiper from "./swiper";
import Actions from "../actions";

interface ProductPageContainerProps {
  productData: ProductDataType;
  variantSlug: string;
  children: ReactNode;
}

export default function ProductPageContainer({
  children,
  productData,
  variantSlug,
}: ProductPageContainerProps) {
  const { id, variants, slug } = productData;

  const [variant, setVariant] = useState<ProductVariantDataType>(
    variants.find((v) => v.slug === variantSlug) || variants[0]
  );

  useEffect(() => {
    const variant = variants.find((v) => v.slug === variantSlug);

    if (variant) {
      setVariant(variant);
    }
  }, [variantSlug, variants]);

  const [sizeId, setSizeId] = useState(
    variant.sizes.length === 1 ? variant.sizes[0].id : ""
  );

  const {
    id: variantId,
    images,
    variantName,
    variantImage,
    weight,
    sizes,
  } = variant;

  const [activeImage, setActiveImage] = useState<{ url: string } | null>(
    images[0]
  );

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="w-full flex-1">
            <ProductSwiper
              images={images}
              activeImage={activeImage || images[0]}
              setActiveImage={setActiveImage}
            />
          </div>

          <div className="space-y-8">
            <ProductInfo
              productData={productData}
              variant={variant}
              setVariant={setVariant}
              variantSlug={variantSlug}
              sizeId={sizeId}
              setSizeId={setSizeId}
              setActiveImage={setActiveImage}
            />

            <div className="w-full lg:w-[390px]">
              <Actions
                shippingFeeMethod={productData.shippingFeeMethod}
                store={productData.store}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
