import {
  CartProductType,
  ProductDataType,
  ShippingDetailsType,
} from "@/lib/types";
import { useEffect, useState } from "react";
import { getShippingDetails } from "@/queries/product";
import { Size, Store } from "@prisma/client";
import ShippingDetails from "./shipping-details";
import { Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ReturnPrivacy from "./return-privacy";
import QuantitySelector from "./quantity-selector";
import AssurancePolicy from "./info/assurance-policy";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface ActionsProps {
  shippingFeeMethod: string;
  store: Store;
  weight?: number | null;
  sizeId?: string;
  productToCart: CartProductType;
  sizes: Size[];
  handleChange: (property: keyof CartProductType, value: any) => void;
  isProductValid: boolean;
}

export default function Actions({
  shippingFeeMethod,
  store,
  weight,
  sizeId,
  productToCart,
  sizes,
  handleChange,
  isProductValid,
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
    <div className="w-full">
      <div className="shadow-sm ">
        {/* <Accordion type="multiple" className="w-full">
          <AccordionItem
            value="shipping-details"
            className="border-b-slate-200"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Truck className="w-5 h-5 text-slate-700" />
                Shipping Details
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              {shippingDetails && (
                <ShippingDetails
                  shippingDetails={shippingDetails}
                  quantity={1}
                  weight={weight}
                  loading={loading}
                />
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="assurance-policy"
            className="border-b-slate-200"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="text-lg font-semibold">Assurance Policy</div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <AssurancePolicy />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="return-privacy" className="border-b-slate-200">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="text-lg font-semibold">
                Return & Privacy Policy
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <ReturnPrivacy
                returnPolicy={shippingDetails?.returnPolicy}
                loading={loading}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion> */}

        {/* Quantity Selector - Outside accordion, stays sticky */}
        <div className="px-0 pb-4">
          {/* {sizeId && (
            <div className="w-full flex">
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
          )} */}

          {shippingDetails && (
            <ShippingDetails
              shippingDetails={shippingDetails}
              weight={weight}
              loading={loading}
              productId={productToCart.productId}
              variantId={productToCart.variantId}
              sizeId={productToCart.sizeId}
              quantity={productToCart.quantity}
              stock={productToCart.stock}
              handleChange={handleChange}
              sizes={sizes}
            />
          )}
          <div className="mt-5 bg-white bottom-0 pb-4 space-y-3 sticky">
            <Button
              onClick={() => {}}
              className={cn(
                "relative w-full py-2.5 min-w-20 bg-orange-background hover:bg-orange-hover text-black h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none"
              )}
            >
              <span>Buy now</span>
            </Button>

            <Button
              className={cn(
                "relative w-full py-2.5 min-w-20 bg-black hover:bg-black/70 text-white h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none"
              )}
              onClick={() => {}}
            >
              <span>Add to cart</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
