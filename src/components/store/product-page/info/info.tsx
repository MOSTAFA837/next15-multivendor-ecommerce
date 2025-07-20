import {
  CartProductType,
  ProductDataType,
  ProductPageDataType,
  ProductVariantDataType,
} from "@/lib/types";
import Link from "next/link";
import ReactStars from "react-rating-stars-component";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { CopyIcon } from "../../icons";
import ProductPrice from "./price";
import Countdown from "../../shared/countdown";
import { Badge } from "@/components/ui/badge";
import { Camera, Star, Tag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ColorWheel from "@/components/shared/color-wheel";
import { Dispatch, SetStateAction } from "react";
import ProductVariantSelector from "./variant-selector";
import AssurancePolicy from "./assurance-policy";
import SizeSelector from "./size-selector";

interface ProductInfoProps {
  productData: ProductDataType;
  variant: ProductVariantDataType;
  setVariant: Dispatch<SetStateAction<ProductVariantDataType>>;
  variantSlug: string;
  sizeId: string | undefined;
  setSizeId: Dispatch<SetStateAction<string>>;
  setActiveImage: Dispatch<SetStateAction<{ url: string } | null>>;
  handleChange: (property: keyof CartProductType, value: any) => void;
}

export default function ProductInfo({
  productData,
  sizeId,
  variant,
  variantSlug,
  setSizeId,
  setVariant,
  setActiveImage,
  handleChange,
}: ProductInfoProps) {
  const { toast } = useToast();

  if (!productData) return null;

  const { name, store, rating, numReviews, variants, brand } = productData;

  const {
    isSale,
    saleEndDate,
    colors,
    id,
    images,
    keywords,
    sizes,
    sku,
    slug,
    specs,
    variantDescription,
    weight,
    variantImage,
    variantName,
  } = variant;

  const copySkuToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sku);

      toast({
        title: "Copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy to clipboard",
      });
    }
  };

  return (
    <div className="relative w-full xl:w-[540px]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href={`/store/${store.url}`} className="mr-2 hover:underline">
            <div className="w-full flex items-center gap-x-1">
              <Image
                src={store.logo}
                alt={store.name}
                width={100}
                height={100}
                className="w-8 h-8 rounded-full object-contain"
              />
            </div>
          </Link>
          <Badge variant="secondary">{brand}</Badge>
          <div className="whitespace-nowrap">
            <span className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-500">
              <span className="font-bold">SKU:</span> {sku}
            </span>
            <span
              className="inline-block align-middle text-[#2F68A8] mx-1 cursor-pointer"
              onClick={copySkuToClipboard}
            >
              <CopyIcon />
            </span>
          </div>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
          {name} - {variantName}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-3 mb-4">
          <ReactStars
            count={5}
            size={24}
            color="#F5F5F5"
            activeColor="#FFD804"
            value={rating}
            isHalf
            edit={false}
          />

          <Link href="#reviews" className="hover:underline">
            (
            {numReviews === 0
              ? "No review yet"
              : numReviews === 1
              ? "1 review"
              : `${numReviews} reviews`}
            )
          </Link>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <ProductPrice
          sizeId={sizeId}
          sizes={sizes}
          handleChange={handleChange}
        />

        {isSale && saleEndDate && (
          <Countdown targetDate={saleEndDate} sizeId={sizeId} sizes={sizes} />
        )}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="relative flex items-center justify-between text-main-primary font-bold">
          <span className="flex items-center gap-x-2">
            {colors.length > 1 ? "Colors" : "Color"}
            <ColorWheel colors={colors} size={35} />
          </span>
        </div>
      </div>

      <div className="mt-4">
        {variants.length > 0 && (
          <ProductVariantSelector
            variants={variants}
            slug={variant.slug}
            setSizeId={setSizeId}
            setVariant={setVariant}
            setActiveImage={setActiveImage}
          />
        )}
      </div>

      <div className="space-y-2 pb-2 mt-4">
        <div>
          <h1 className="text-main-primary font-bold">Size </h1>
        </div>

        <SizeSelector
          sizes={variant.sizes}
          sizeId={sizeId}
          setSizeId={setSizeId}
        />
      </div>

      <Separator className="mt-2" />
      <AssurancePolicy />

      <div className="p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-slate-600" />
          Product Tags
        </h3>

        <div className="flex flex-wrap gap-2">
          {variant.keywords.split(",").map((k, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-all duration-200 cursor-pointer hover:scale-105 shadow-sm"
            >
              {k.trim()}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
