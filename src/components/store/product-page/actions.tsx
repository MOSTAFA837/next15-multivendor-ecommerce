import { ShippingDetailsType } from "@/lib/types";
import { useEffect, useState } from "react";
import { getShippingDetails } from "@/queries/product";
import { Store } from "@prisma/client";
import ShippingDetails from "./shipping-details";
import { Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActionsProps {
  shippingFeeMethod: string;
  store: Store;
  weight?: number | null;
}

export default function Actions({
  shippingFeeMethod,
  store,
  weight,
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
        </CardContent>
      </Card>
    </div>
  );
}
