import {
  getAllStoreProducts,
  getProductPageData,
  getProducts,
  getShippingDetails,
  retrieveProductDetails,
  retrieveProductDetailsOptimized,
} from "@/queries/product";
import { getStoreDefaultShippingDetails } from "@/queries/store";
import { getAllSubCategories } from "@/queries/sub-category";
import {
  Category,
  Prisma,
  ProductVariantImage,
  ShippingRate,
  Size,
  Spec,
  SubCategory,
} from "@prisma/client";
import countries from "@/data/countries.json";

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
