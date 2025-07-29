"use client";

import {
  CartProductType,
  ProductDataType,
  ProductVariantDataType,
} from "@/lib/types";
import { ReactNode, useEffect, useMemo, useState } from "react";
import ProductInfo from "./info";
import ProductSwiper from "./swiper";
import Actions from "../actions";
import { isProductValidToAdd, updateProductHistory } from "@/lib/utils";
import { useCartStore } from "@/cart/use-cart";
import useFromStore from "@/hooks/use-from-store";

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
  const { id, variants, slug, specs, questions, description } = productData;

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
    variantDescription,
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

  useEffect(() => {
    setProductToCart((prevProduct) => ({
      ...prevProduct,
      productId: id,
      variantId,
      productSlug: slug,
      variantSlug: variant.slug,
      name: productData.name,
      variantName: variantName,
      image: images[0].url,
      variantImage: variantImage,
      stock: variant.sizes.find((s) => s.id === sizeId)?.quantity || 1,
      weight: weight,
    }));
  }, [
    id,
    slug,
    variantSlug,
    variant,
    productData,
    variantName,
    variantImage,
    weight,
    images,
    sizeId,
    variantId,
  ]);

  const cartItems = useFromStore(useCartStore, (state) => state.cart);

  const maxQty = useMemo(() => {
    const search_product = cartItems?.find(
      (p) =>
        p.productId === id && p.variantId === variantId && p.sizeId === sizeId
    );
    return search_product
      ? search_product.stock - search_product.quantity
      : productToCart.stock;
  }, [cartItems, productToCart.stock, id, variantId, sizeId]);

  // Get the set Cart action to update items in cart
  const setCart = useCartStore((state) => state.setCart);

  // Keeping cart state updated
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Check if the "cart" key was changed in localStorage
      if (event.key === "cart") {
        try {
          const parsedValue = event.newValue
            ? JSON.parse(event.newValue)
            : null;

          // Check if parsedValue and state are valid and then update the cart
          if (
            parsedValue &&
            parsedValue.state &&
            Array.isArray(parsedValue.state.cart)
          ) {
            setCart(parsedValue.state.cart);
          }
        } catch (error) {}
      }
    };

    // Attach the event listener
    window.addEventListener("storage", handleStorageChange);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Add product to history
  updateProductHistory(variantId);

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
              specs={{ product: specs, variant: variant.specs }}
              questions={questions}
              text={[description, variantDescription || ""]}
              maxQty={maxQty}
              productId={id}
              variantId={variantId}
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
