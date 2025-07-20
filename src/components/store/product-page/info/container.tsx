"use client";

import { ProductPageDataType } from "@/lib/types";
import { ReactNode } from "react";
import ProductInfo from "./info";
import ProductSwiper from "./swiper";

interface ProductPageContainerProps {
  productData: ProductPageDataType;
  sizeId?: string;
  variantSlug: string;
  children: ReactNode;
}

export default function ProductPageContainer({
  children,
  productData,
  sizeId,
  variantSlug,
}: ProductPageContainerProps) {
  if (!productData) return null;
  const { images } = productData;

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="w-full flex-1">
            <ProductSwiper images={images} />
          </div>

          <div className="space-y-8">
            <ProductInfo productData={productData} sizeId={sizeId} />
          </div>
        </div>
      </div>
    </div>
  );
}
