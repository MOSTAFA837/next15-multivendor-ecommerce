import {
  getAllStoreProducts,
  getProductPageData,
  getProducts,
  getRatingStats,
  getShippingDetails,
  retrieveProductDetails,
  retrieveProductDetailsOptimized,
} from "@/queries/product";
import { getStoreDefaultShippingDetails } from "@/queries/store";
import { getAllSubCategories } from "@/queries/sub-category";
import {
  Cart,
  CartItem,
  Category,
  Coupon,
  Prisma,
  ProductVariantImage,
  Review,
  ShippingAddress,
  ShippingFeeMethod,
  ShippingRate,
  Size,
  Spec,
  Store,
  SubCategory,
  User,
} from "@prisma/client";
import countries from "@/data/countries.json";
import { getUserOrders, getUserPayments } from "@/queries/profile";

export interface DashboardSidebarMenuInterface {
  label: string;
  icon: string;
  link: string;
}

export type SubCategoryWithCategoryType = Prisma.PromiseReturnType<
  typeof getAllSubCategories
>[0];

export type ProductWithVariantType = {
  productId: string;
  variantId: string;
  name: string;
  description: string;
  variantName: string;
  variantDescription: string;
  images: { id?: string; url: string }[];
  variantImage: string;
  categoryId: string;
  subCategoryId: string;
  isSale: boolean;
  saleEndDate?: string;
  brand: string;
  sku: string;
  colors: { id?: string; color: string }[];
  sizes: {
    id?: string;
    size: string;
    quantity: number;
    price: number;
    discount?: number;
  }[];
  keywords: string[];
  product_specs: { id?: string; name: string; value: string }[];
  variant_specs: { id?: string; name: string; value: string }[];
  questions: { id?: string; question: string; answer: string }[];
  offerTagId: string;
  weight: number | null;
  shippingFeeMethod: ShippingFeeMethod;
  createdAt: Date;
  updatedAt: Date;
};

export type StoreProductType = Prisma.PromiseReturnType<
  typeof getAllStoreProducts
>[0];

export type StoreShippingType = Prisma.PromiseReturnType<
  typeof getStoreDefaultShippingDetails
>;

export type CountryWithShippingRatesType = {
  countryId: string;
  countryName: string;
  shippingRate: ShippingRate;
};

export type StoreDefaultShippingType = Prisma.PromiseReturnType<
  typeof getStoreDefaultShippingDetails
>;

export enum StoreStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  BANNED = "BANNED",
  DISABLED = "DISABLED",
}

export type StoreType = {
  name: string;
  description: string;
  email: string;
  phone: string;
  logo: string;
  cover: string;
  url: string;
  defaultShippingService: string;
  defaultDeliveryTimeMax?: number;
  defaultDeliveryTimeMin?: number;
  defaultShippingFeeFixed?: number;
  defaultShippingFeeForAdditionalItem?: number;
  defaultShippingFeePerItem?: number;
  defaultShippingFeePerKg?: number;
  returnPolicy?: string;
};

export interface Country {
  name: string;
  code: string;
  city: string;
  region: string;
}

export type SelectMenuOption = (typeof countries)[number];

export type CategoryWithSubCategories = Category & {
  subCategories: SubCategory[];
};

export type ProductType = Prisma.PromiseReturnType<
  typeof getProducts
>["products"][0];

export type VariantSimplified = {
  variantId: string;
  variantSlug: string;
  variantName: string;
  images: ProductVariantImage[];
  sizes: Size[];
};

export type VariantImageType = {
  url: string;
  image: string;
};

export type ProductPageType = Prisma.PromiseReturnType<
  typeof retrieveProductDetails
>;

export type ProductPageDataType = Prisma.PromiseReturnType<
  typeof getProductPageData
>;

export type ProductVariantDataType = {
  id: string;
  variantName?: string | null;
  slug: string;
  sku: string;
  variantImage?: string | null;
  weight: number | null;
  isSale: boolean;
  saleEndDate: string | null;
  variantDescription: string | null;
  images: {
    url: string;
  }[];
  sizes: Size[];
  specs: Spec[];
  colors: { name: string }[];
  keywords: string;
};

export type ProductDataType = Prisma.PromiseReturnType<
  typeof retrieveProductDetailsOptimized
>;

export type ProductShippingDetailsType = Prisma.PromiseReturnType<
  typeof getShippingDetails
>;

export type ShippingDetailsType = {
  shippingFeeMethod: string;
  shippingFee: number;
  extraShippingFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  shippingService: string;
  returnPolicy: string;
};

export type CartProductType = {
  productId: string;
  variantId: string;
  productSlug: string;
  variantSlug: string;
  name: string;
  variantName?: string | null;
  image: string;
  variantImage?: string | null;
  sizeId: string;
  size: string;
  quantity: number;
  price: number;
  stock: number;
  weight: number | null;
  shippingMethod: string;
  shippingService: string;
  shippingFee: number;
  extraShippingFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
};

export type ReviewWithImageType = Review & {
  user: User;
};

export type ReviewDetailsType = {
  id: string;
  review?: string | null;
  rating: number;
  size: string;
  variant: string;
  color: string;
};

export type RatingStatisticsType = Prisma.PromiseReturnType<
  typeof getRatingStats
>;

export type ReviewsFiltersType = {
  rating?: number;
};

export type ReviewsOrderType = {
  orderBy: "latest" | "oldest" | "highest";
};

export type StatisticsCardType = Prisma.PromiseReturnType<
  typeof getRatingStats
>["ratingStats"];

export type SortOrder = "asc" | "desc";

export type CartWithCartItemsType = Cart & {
  items: CartItem[];
  coupon: (Coupon & { store: Store }) | null;
};

export type UserShippingAddressType = ShippingAddress & {
  user: User;
};

export type OrderTableFilter =
  | ""
  | "unpaid"
  | "toShip"
  | "shipped"
  | "delivered";

export type OrderTableDateFilter =
  | ""
  | "last-6-months"
  | "last-1-year"
  | "last-2-years";

export enum OrderStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Processing = "Processing",
  Shipped = "Shipped",
  OutforDelivery = "OutforDelivery",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  Failed = "Failed",
  Refunded = "Refunded",
  Returned = "Returned",
  PartiallyShipped = "PartiallyShipped",
  OnHold = "OnHold",
}

export enum PaymentStatus {
  Pending = "Pending",
  Paid = "Paid",
  Failed = "Failed",
  Declined = "Declined",
  Cancelled = "Cancelled",
  Refunded = "Refunded",
  PartiallyRefunded = "PartiallyRefunded",
  Chargeback = "Chargeback",
}

export type UserOrderType = Prisma.PromiseReturnType<
  typeof getUserOrders
>["orders"][0];

export type UserPaymentType = Prisma.PromiseReturnType<
  typeof getUserPayments
>["payments"][0];

export type PaymentTableFilter = "" | "paypal" | "credit-card";

export type PaymentTableDateFilter =
  | ""
  | "last-6-months"
  | "last-1-year"
  | "last-2-years";

export type ReviewDateFilter =
  | ""
  | "last-6-months"
  | "last-1-year"
  | "last-2-years";

export type ReviewFilter = "5" | "4" | "3" | "2" | "1" | "";
