import {
  CartProductType,
  ProductDataType,
  ShippingDetailsType,
} from "@/lib/types";
import { useEffect, useState } from "react";
import { getShippingDetails } from "@/queries/product";
import { Size, Store } from "@prisma/client";
import ShippingDetails from "./shipping-details";
import { FileText, MessageCircleQuestion, Settings, Truck } from "lucide-react";
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
import Specifications from "./specifications";
import { Questions } from "./questions";
import Descriptions from "./descriptions";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/cart/use-cart";
import { toast } from "@/hooks/use-toast";
import { addToWishList, checkIfAddedToWishlist } from "@/queries/user";
import { Heart } from "lucide-react";

interface Specs {
  name: string;
  value: string;
}

interface Question {
  question: string;
  answer: string;
}

interface ActionsProps {
  shippingFeeMethod: string;
  store: Store;
  weight?: number | null;
  sizeId?: string;
  productToCart: CartProductType;
  sizes: Size[];
  handleChange: (property: keyof CartProductType, value: any) => void;
  isProductValid: boolean;
  specs: {
    product: Specs[];
    variant: Specs[] | undefined;
  };
  questions: Question[];
  text: [string, string];
  maxQty: number;
  productId: string;
  variantId: string;
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
  specs,
  questions,
  text: [description, variantDescription],
  maxQty,
  productId,
  variantId,
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

  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    if (maxQty <= 0) return;

    addToCart(productToCart);

    toast({
      title: "Product added",
      description: "The product has been added to your cart.",
    });
  };

  const cartItems = useCartStore((state) => state.cart);

  const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);

  // Handle add product to wishlist
  const handleaddToWishlist = async () => {
    try {
      const res = await addToWishList(productId, variantId, sizeId);
      toast({
        title: res.id
          ? "Product added to wishlist"
          : "Product removed from wishlist",
      });
      if (res.id) {
        setIsAddedToWishlist(true);
      } else {
        setIsAddedToWishlist(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    if (!productId || !variantId || !sizeId) return;

    const checkWishlist = async () => {
      const res = await checkIfAddedToWishlist(productId, variantId, sizeId);
      setIsAddedToWishlist(res);
    };

    checkWishlist();
  }, [productId, sizeId, variantId]);

  return (
    <div className="w-full">
      <div className="shadow-sm ">
        {/* Quantity Selector - Outside accordion, stays sticky */}
        <div className="px-0 pb-4">
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
            <button
              onClick={() => handleaddToWishlist()}
              className={cn(
                "relative w-full flex items-center justify-center gap-x-4 py-2.5 min-w-20 bg-white hover:bg-orange-hover/70 text-orange-background border-orange-background  h-11 rounded-3xl leading-6 font-bold whitespace-nowrap border hover:text-white cursor-pointer transition-all duration-300 ease-bezier-1 select-none"
              )}
            >
              <Heart
                className={cn("", {
                  "stroke-orange-seconadry fill-orange-seconadry":
                    isAddedToWishlist,
                })}
              />
              <span>
                {isAddedToWishlist ? "Added to wishlist" : "Add to wishlist"}
              </span>
            </button>

            <Button
              onClick={() => {
                handleAddToCart();
              }}
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
              onClick={handleAddToCart}
            >
              <span>Add to cart</span>
            </Button>
          </div>
        </div>

        <Accordion
          type="multiple"
          className="w-full bg-white rounded-lg shadow-sm border border-slate-200"
        >
          <AccordionItem
            value="specifications"
            className="border-b border-slate-100 last:border-b-0"
          >
            <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 group-hover:text-slate-900">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                Specifications
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 bg-slate-50/50">
              {(specs.product || specs.variant) && (
                <div className="pt-2">
                  <Specifications specs={specs} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <Separator />

          <AccordionItem
            value="questions"
            className="border-b border-slate-100 last:border-b-0"
          >
            <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 group-hover:text-slate-900">
                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                  <MessageCircleQuestion className="w-5 h-5 text-green-600" />
                </div>
                Questions
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 bg-slate-50/50">
              {questions && (
                <div className="pt-2">
                  <Questions questions={questions} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <Separator />

          <AccordionItem
            value="description"
            className="border-b border-slate-100 last:border-b-0"
          >
            <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 group-hover:text-slate-900">
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                Description
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 bg-slate-50/50">
              <div className="pt-2">
                <Descriptions text={[description, variantDescription || ""]} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
