import { CartProductType, ShippingDetailsType } from "@/lib/types";
import { useEffect, useState } from "react";
import { getShippingDetails } from "@/queries/product";
import { Size, Store } from "@prisma/client";
import ShippingDetails from "./shipping-details";
import { Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReturnPrivacy from "./return-privacy";
import QuantitySelector from "./quantity-selector";

interface ActionsProps {
  shippingFeeMethod: string;
  store: Store;
  weight?: number | null;
  sizeId?: string;
  productToCart: CartProductType;
  sizes: Size[];
  handleChange: (property: keyof CartProductType, value: any) => void;
}

export default function Actions({
  shippingFeeMethod,
  store,
  weight,
  sizeId,
  productToCart,
  sizes,
  handleChange,
}: ActionsProps) {
  const [loading, setLoading] = useState(true);

  const [shippingDetails, setShippingDetails] =
    useState<ShippingDetailsType | null>(null);

  useEffect(() => {
    const getShippingDetailsHandler = async () => {
      const data = await getShippingDetails(shippingFeeMethod, store);

      if (data) {
        setShippingDetails(data);
        setLoading(false);
      } else {
        setShippingDetails(null);
      }
    };

    getShippingDetailsHandler();
  }, [shippingFeeMethod, store]);

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="shadow-sm border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="w-5 h-5 text-slate-700" />
            Shipping
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {shippingDetails && (
            <ShippingDetails
              shippingDetails={shippingDetails}
              quantity={1}
              weight={weight}
              loading={loading}
            />
          )}

          <ReturnPrivacy
            returnPolicy={shippingDetails?.returnPolicy}
            loading={loading}
          />

          <div className="mt-5 bg-white bottom-0 pb-4 space-y-3 sticky">
            {sizeId && (
              <div className="w-full flex justify-end mt-4">
                <QuantitySelector
                  productId={productToCart.productId}
                  variantId={productToCart.variantId}
                  sizeId={productToCart.sizeId}
                  quantity={productToCart.quantity}
                  stock={productToCart.stock}
                  handleChange={handleChange}
                  sizes={sizes}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
