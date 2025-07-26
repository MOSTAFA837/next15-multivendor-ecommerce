"use client";
import { UserShippingAddressType } from "@/lib/types";
import { Country, ShippingAddress } from "@prisma/client";
import { FC, useState } from "react";
import ShippingAddresses from "../../shared/shipping-address";

interface Props {
  addresses: UserShippingAddressType[];
}

const AddressContainer: FC<Props> = ({ addresses }) => {
  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null);
  return (
    <div className="w-full">
      <ShippingAddresses
        addresses={addresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
      />
    </div>
  );
};

export default AddressContainer;
