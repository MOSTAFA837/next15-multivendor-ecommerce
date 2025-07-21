"use client";

import useFromStore from "@/hooks/use-from-store";
import { CartProductType } from "@/lib/types";
import { useState } from "react";
import CartHeader from "./header";
import CartProduct from "../cards/cart-product";
import CartSummary from "./summary";
import FastDelivery from "../cards/fast-delivery";
import EmptyCart from "./empty-cart";
import { useCartStore } from "@/cart/use-cart";

export default function CartContainer() {
  const cartItems = useFromStore(useCartStore, (state) => state.cart) || [];

  const [selectedItems, setSelectedItems] = useState<CartProductType[]>([]);
  const [totalShipping, setTotalShipping] = useState<number>(0);

  return (
    <div>
      {cartItems && cartItems.length > 0 ? (
        <div className="bg-[#f5f5f5] min-h-[calc(100vh-65px)] px-2">
          <div className="max-w-[1200px] mx-auto py-4 flex flex-col gap-y-4 lg:flex-row">
            <div className="min-w-0 flex-1">
              {/* Cart header */}
              <CartHeader
                cartItems={cartItems}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
              />

              <div className="h-auto overflow-x-hidden overflow-auto mt-2">
                {cartItems.map((product) => (
                  <CartProduct
                    key={`${product.productSlug}-${product.variantSlug}`}
                    product={product}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    setTotalShipping={setTotalShipping}
                  />
                ))}
              </div>
            </div>

            {/* Cart side */}
            <div className="sticky top-4 lg:ml-5 w-full lg:w-[380px] max-h-max">
              <CartSummary cartItems={cartItems} shippingFees={totalShipping} />

              <div className="mt-2 p-4 bg-white px-6">
                <FastDelivery />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyCart />
      )}
    </div>
  );
}
