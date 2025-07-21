import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Truck } from "lucide-react";

import { CartProductType, ProductShippingDetailsType } from "@/lib/types";
import { getMonthDay, getShippingDateRange } from "@/lib/utils";
import ShippingFee from "./shipping-fee";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Size } from "@prisma/client";
import QuantitySelector from "./quantity-selector";

interface ShippingDetailsProps {
  shippingDetails: ProductShippingDetailsType;
  quantity: number;
  weight?: number | null;
  loading: boolean;
  productId: string;
  variantId: string;
  sizeId: string | null;
  stock: number;
  handleChange: (property: keyof CartProductType, value: any) => void;
  sizes: Size[];
}

export default function ShippingDetails({
  shippingDetails,
  quantity,
  weight,
  loading,
  productId,
  variantId,
  sizeId,
  stock,
  handleChange,
  sizes,
}: ShippingDetailsProps) {
  const [shippingTotal, setShippingTotal] = useState<number>();

  useEffect(() => {
    if (!shippingDetails) return;

    const { shippingFee, shippingFeeMethod, extraShippingFee } =
      shippingDetails;

    switch (shippingFeeMethod) {
      case "ITEM":
        const qty = quantity - 1;
        setShippingTotal(shippingFee + qty * extraShippingFee);
        break;

      case "WEIGHT":
        setShippingTotal(shippingFee * quantity);
        break;

      case "FIXED":
        setShippingTotal(shippingFee);
        break;

      default:
        setShippingTotal(0);
        break;
    }
  }, [quantity, shippingDetails]);

  const {
    shippingFee = 0,
    extraShippingFee = 0,
    shippingFeeMethod = "Loading...",
    shippingService = "Loading...",
    deliveryTimeMin = 0,
    deliveryTimeMax = 0,
  } = shippingDetails || {};

  const { minDate, maxDate } = shippingDetails
    ? getShippingDateRange(deliveryTimeMin, deliveryTimeMax)
    : { minDate: "Loading...", maxDate: "Loading..." };

  return (
    <Card className="w-full max-w-2xl">
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Truck className="h-5 w-5" />
              </div>

              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-900">
                  Shipping
                </span>
                <span className="text-sm text-gray-500">
                  Total:{" "}
                  <span className="font-medium text-gray-900">
                    ${shippingTotal}
                  </span>
                </span>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-gray-400" />

            {sizeId && (
              <div className="flex">
                <QuantitySelector
                  productId={productId}
                  variantId={variantId}
                  sizeId={sizeId}
                  quantity={quantity}
                  stock={stock}
                  handleChange={handleChange}
                  sizes={sizes}
                />
              </div>
            )}
          </div>

          {/* Service Details */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Service:
              </span>
              <Badge variant="secondary" className="font-medium">
                {shippingService}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Delivery:
              </span>
              <span className="text-sm font-medium text-gray-900">
                {getMonthDay(minDate)} ~ {getMonthDay(maxDate)}
              </span>
            </div>
          </div>

          {/* Shipping Fee Details */}
          <div className="border-t pt-4">
            <ShippingFee
              fee={shippingFee}
              extraFee={extraShippingFee}
              method={shippingFeeMethod}
              quantity={quantity}
              weight={weight}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
