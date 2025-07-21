"use client";

import {
  CartProductType,
  ProductDataType,
  ProductPageDataType,
  ProductVariantDataType,
} from "@/lib/types";
import { ReactNode, useEffect, useState } from "react";
import ProductInfo from "./info";
import ProductSwiper from "./swiper";
import Actions from "../actions";
import { isProductValidToAdd } from "@/lib/utils";

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

  // initialize the default product data for the cart item
  const data: CartProductType = {
    productId: id,
    variantId,
    productSlug: slug,
    variantSlug,
    name: productData.name,
    variantName,
    image: images[0].url,
    variantImage,
    sizeId: sizeId || "",
    size: "",
    quantity: 1,
    price: 0,
    stock: 1,
    weight,
    shippingMethod: productData.shippingFeeMethod,
    shippingService: "",
    shippingFee: 0,
    extraShippingFee: 0,
    deliveryTimeMin: 0,
    deliveryTimeMax: 0,
  };

  const [productToCart, setProductToCart] = useState<CartProductType>(data);
  const [isProductValid, setIsProductValid] = useState<boolean>(false);

  const handleChange = (property: keyof CartProductType, value: any) => {
    setProductToCart((prev) => ({ ...prev, [property]: value }));
  };

  useEffect(() => {
    const check = isProductValidToAdd(productToCart);

    if (check !== isProductValid) {
      setIsProductValid(check);
    }
  }, [isProductValid, productToCart]);

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
              handleChange={handleChange}
            />

            <Actions
              shippingFeeMethod={productData.shippingFeeMethod}
              store={productData.store}
              weight={weight}
              sizeId={sizeId}
              productToCart={productToCart}
              handleChange={handleChange}
              sizes={sizes}
              isProductValid={isProductValid}
            />
          </div>
        </div>

        <div
          id="children-container"
          className="lg:w-[calc(100%-410px)] mt-6 pb-16"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
