import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ShippingFeeProps {
  method: string;
  fee: number;
  extraFee: number;
  weight?: number | null;
  quantity: number;
}

export default function ShippingFee({
  extraFee,
  fee,
  method,
  quantity,
  weight,
}: ShippingFeeProps) {
  switch (method) {
    case "ITEM":
      return (
        <div className="space-y-4">
          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
              <p className="text-sm text-gray-600">
                This store calculates the delivery fee based on the number of
                items in the order.
              </p>
            </div>

            {fee !== extraFee && (
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <p className="text-sm text-gray-600">
                  If you purchase multiple items, you&apos;ll receive a
                  discounted delivery fee.
                </p>
              </div>
            )}
          </div>

          {/* Fee Structure */}
          <Card className="border-gray-200">
            <CardContent className="">
              {fee === extraFee || extraFee === 0 ? (
                <div className="grid grid-cols-2 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Fee per item
                  </span>
                  <Badge variant="outline" className="justify-center">
                    ${fee}
                  </Badge>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Fee for First Item
                    </span>
                    <Badge variant="outline" className="justify-center">
                      ${fee}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Fee for Each Additional Item
                    </span>
                    <Badge variant="outline" className="justify-center">
                      ${extraFee}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Quantity
                  </span>
                  <Badge variant="outline" className="justify-center">
                    x{quantity}
                  </Badge>
                </div>

                <div className="bg-gray-900 text-white border-gray-900 py-2 rounded-md">
                  <div className="text-center text-sm font-medium">
                    {quantity === 1 || fee === extraFee ? (
                      <span>
                        ${fee} (fee) × {quantity} (items) = ${fee * quantity}
                      </span>
                    ) : (
                      <span>
                        ${fee} (first item) + {quantity - 1} (additional items)
                        × ${extraFee} = ${fee + extraFee * (quantity - 1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case "WEIGHT":
      return (
        <div className="space-y-4">
          {/* Notes */}
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            <p className="text-sm text-gray-600">
              This store calculates the delivery fee based on product weight.
            </p>
          </div>

          {/* Fee Structure */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 items-center mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Fee per kg{" "}
                  <span className="text-xs text-gray-500">
                    (1kg = 2.205lbs)
                  </span>
                </span>
                <Badge variant="outline" className="justify-center">
                  ${fee}
                </Badge>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Quantity
                  </span>
                  <Badge variant="secondary" className="justify-center">
                    x{quantity}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Weight
                  </span>
                  <Badge variant="secondary" className="justify-center">
                    {weight}kg
                  </Badge>
                </div>

                <Card className="bg-gray-900 text-white border-gray-900">
                  <CardContent className="p-3">
                    <div className="text-center text-sm font-medium">
                      ${fee} (fee) × {weight ?? 0}kg (weight) × {quantity}{" "}
                      (items) = ${(fee * (weight ?? 0) * quantity).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case "FIXED":
      return (
        <div className="space-y-4">
          {/* Notes */}
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            <p className="text-sm text-gray-600">
              This store calculates the delivery fee on a fixed price.
            </p>
          </div>

          {/* Fee Structure */}
          <Card className="border-gray-200">
            <CardContent className="">
              <div className="grid grid-cols-2 gap-4 items-center mb-4">
                <span className="text-sm font-medium text-gray-700">Fee</span>
                <Badge variant="outline" className="justify-center">
                  ${fee}
                </Badge>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Quantity
                  </span>
                  <Badge variant="outline" className="justify-center">
                    x{quantity}
                  </Badge>
                </div>

                <div className="bg-gray-900 text-white border-gray-900 py-2 rounded-md">
                  <div className="text-center text-sm font-medium">
                    ${fee} (quantity doesn&apos;t affect shipping fee.)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    default:
      return null;
  }
}
