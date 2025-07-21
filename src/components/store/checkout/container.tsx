"use client";

import {
  CartWithCartItemsType,
  Country as CountryType,
  UserShippingAddressType,
} from "@/lib/types";
import { ShippingAddress } from "@prisma/client";

import { useState } from "react";
import CheckoutProductCard from "../cards/checkout-product";
import PlaceOrder from "../cards/place-order";
import ShippingAddresses from "../shared/shipping-address";

interface Props {
  cart: CartWithCartItemsType;
  addresses: UserShippingAddressType[];
}

export default function CheckoutContainer({ cart, addresses }: Props) {
  const [data, setData] = useState<CartWithCartItemsType>(cart);
  const { items } = data;

  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null);

  return (
    <div className="w-full flex flex-col gap-y-2 lg:flex-row">
      <div className="space-y-2 lg:flex-1">
        <ShippingAddresses
          addresses={addresses}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />

        {items.map((product) => (
          <CheckoutProductCard key={product.variantId} product={product} />
        ))}
      </div>

      <PlaceOrder
        cartData={data}
        setCartData={setData}
        shippingAddress={selectedAddress}
      />
    </div>
  );
}
