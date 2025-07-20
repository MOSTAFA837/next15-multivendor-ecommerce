import { ProductShippingDetailsType } from "@/lib/types";
import { Clock, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";

interface ShippingDetailsProps {
  shippingDetails: ProductShippingDetailsType;
  quantity: number;
  weight: number;
}

export default function ShippingDetails({
  shippingDetails,
  quantity,
  weight,
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <Truck className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900">
            {shippingDetails.shippingService}
          </p>
          <p className="text-xs text-slate-600">
            {shippingDetails.shippingFeeMethod} based pricing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div>
            <p className="text-xs text-slate-600">Shipping Fee</p>
            <p className="text-sm font-semibold text-slate-900">
              ${shippingDetails.shippingFee}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <div>
            <p className="text-xs text-slate-600">Extra Fee</p>
            <p className="text-sm font-semibold text-slate-900">
              ${shippingDetails.extraShippingFee}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
        <Clock className="w-5 h-5 text-slate-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900">Delivery Time</p>
          <p className="text-xs text-slate-600">
            {shippingDetails.deliveryTimeMin}-{shippingDetails.deliveryTimeMax}{" "}
            days
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
        <Package className="w-5 h-5 text-purple-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900">Return Policy</p>
          <p className="text-xs text-slate-600 capitalize">
            {shippingDetails.returnPolicy}
          </p>
        </div>
      </div>
    </div>
  );
}
