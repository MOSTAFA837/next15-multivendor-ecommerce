"use client";

import { useCartStore } from "@/cart/use-cart";
import useFromStore from "@/hooks/use-from-store";
import { CartProductType, Country } from "@/lib/types";
import EmptyCart from "./empty-cart";
import { useEffect, useRef, useState } from "react";
import CartProduct from "../cards/cart-product";
import CartHeader from "./header";
import CartSummary from "./summary";
import FastDelivery from "../cards/fast-delivery";
import { updateCartWithLatest } from "@/queries/user";

export default function CartContainer() {
  const cartItems = useFromStore(useCartStore, (state) => state.cart) || [];
  const setCart = useCartStore((state) => state.setCart);

  const [selectedItems, setSelectedItems] = useState<CartProductType[]>([]);
  const [totalShipping, setTotalShipping] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [isCartLoaded, setIsCartLoaded] = useState<boolean>(false);

  // Ref to track if the component has mounted
  const hasMounted = useRef(false);

  useEffect(() => {
    if (cartItems !== undefined) {
      setIsCartLoaded(true); // Flag indicating cartItems has finished loading
    }
  }, [cartItems]);

  useEffect(() => {
    const loadAndSyncCart = async () => {
      try {
        setLoading(true);
        const updatedCart = await updateCartWithLatest(cartItems);
        setCart(updatedCart);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    // Run only when userCountry changes and after the initial mount
    if (hasMounted.current && cartItems?.length) {
      loadAndSyncCart();
    } else {
      hasMounted.current = true; // Set the ref to true after the first render
    }
  }, []);

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
