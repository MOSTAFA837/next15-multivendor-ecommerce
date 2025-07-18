"use client";

// React, Next.js
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Prisma model
import { Category, OfferTag, SubCategory } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { ProductFormSchema } from "@/lib/schemas";

// UI Components
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "../shared/image-upload";
import { useToast } from "@/hooks/use-toast";

// Queries
import { upsertProduct } from "@/queries/product";
import { getSubCategoriesForCategory } from "@/queries/sub-category";

// ReactTags
import { WithOutContext as ReactTags } from "react-tag-input";

// Utils
import { v4 } from "uuid";

// Types
import { ProductWithVariantType } from "@/lib/types";
import ImagesPreviewGrid from "../shared/images-preview-grid";
import ClickToAddInputs from "./click-to-add";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// React date time picker
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { format } from "date-fns";

// Jodit text editor
import {
  ArrowRight,
  Calendar,
  Dot,
  FileText,
  HelpCircle,
  ImageIcon,
  Package2,
  Scale,
  Settings,
  Tag,
  X,
} from "lucide-react";
import { generateRandomSKU } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import JoditEditor from "jodit-react";
import { NumberInput } from "@tremor/react";
import { Badge } from "@/components/ui/badge";
import InputFieldset from "../shared/input-fieldset";

interface ProductDetailsProps {
  data?: Partial<ProductWithVariantType>;
  categories: Category[];
  storeUrl: string;
  offerTags: OfferTag[];
}

const ProductDetails: FC<ProductDetailsProps> = ({
  data,
  categories,
  storeUrl,
  offerTags,
}) => {
  console.log(data?.colors, "colors");
  // Initializing necessary hooks
  const { toast } = useToast(); // Hook for displaying toast messages
  const router = useRouter(); // Hook for routing

  // Jodit editor refs
  const productDescEditor = useRef(null);
  const variantDescEditor = useRef(null);

  // Is new variant page
  const isNewVariantPage = data?.productId && !data?.variantId;

  // State for subCategories
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  // State for colors
  const [colors, setColors] = useState<{ color: string }[]>(
    data?.colors || [{ color: "" }]
  );

  // Temporary state for images
  const [images, setImages] = useState<{ url: string }[]>([]);

  // State for sizes
  const [sizes, setSizes] = useState<
    { size: string; price: number; quantity: number; discount?: number }[]
  >(data?.sizes || [{ size: "", quantity: 1, price: 0.01, discount: 0 }]);

  // State for product specs
  const [productSpecs, setProductSpecs] = useState<
    { name: string; value: string }[]
  >(data?.product_specs || [{ name: "", value: "" }]);

  // State for product variant specs
  const [variantSpecs, setVariantSpecs] = useState<
    { name: string; value: string }[]
  >(data?.variant_specs || [{ name: "", value: "" }]);

  const [questions, setQuestions] = useState<
    { question: string; answer: string }[]
  >(data?.questions || [{ question: "", answer: "" }]);

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof ProductFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(ProductFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: data?.name,
      description: data?.description,
      variantName: data?.variantName,
      variantDescription: data?.variantDescription,
      images: data?.images || [],
      variantImage: data?.variantImage ? [{ url: data.variantImage }] : [],
      categoryId: data?.categoryId,
      subCategoryId: data?.subCategoryId,
      brand: data?.brand,
      sku: generateRandomSKU(),
      colors: data?.colors,
      sizes: data?.sizes,
      keywords: data?.keywords,
      product_specs: data?.product_specs,
      variant_specs: data?.variant_specs,
      questions: data?.questions,
      offerTagId: data?.offerTagId,
      isSale: data?.isSale || false,
      weight: data?.weight,
      saleEndDate:
        data?.saleEndDate || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    },
  });

  const saleEndDate = form.getValues().saleEndDate || new Date().toISOString();

  const formattedDate = new Date(saleEndDate).toLocaleString("en-Us", {
    weekday: "short", // Abbreviated day name (e.g., "Mon")
    month: "long", // Abbreviated month name (e.g., "Nov")
    day: "2-digit", // Two-digit day (e.g., "25")
    year: "numeric", // Full year (e.g., "2024")
    hour: "2-digit", // Two-digit hour (e.g., "02")
    minute: "2-digit", // Two-digit minute (e.g., "30")
    second: "2-digit", // Two-digit second (optional)
    hour12: false, // 12-hour format (change to false for 24-hour format)
  });

  // UseEffect to get subCategories when user pick/change a category
  useEffect(() => {
    const getSubCategories = async () => {
      const res = await getSubCategoriesForCategory(form.watch().categoryId);
      setSubCategories(res);
    };
    getSubCategories();
  }, [form]);

  // Extract errors state from form
  const errors = form.formState.errors;

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        variantImage: data.variantImage ? [{ url: data.variantImage }] : [],
      });
    }
  }, [data, form]);

  // Submit handler for form submission
  const handleSubmit = async (values: z.infer<typeof ProductFormSchema>) => {
    try {
      // Upserting product data
      await upsertProduct(
        {
          productId: data?.productId ? data.productId : v4(),
          variantId: data?.variantId ? data.variantId : v4(),
          name: values.name,
          description: values.description,
          variantName: values.variantName || "",
          variantDescription: values.variantDescription || "",
          images: values.images,
          variantImage: values.variantImage[0].url,
          categoryId: values.categoryId,
          subCategoryId: values.subCategoryId,
          isSale: values.isSale || false,
          saleEndDate: values.saleEndDate,
          brand: values.brand,
          sku: values.sku,
          colors: values.colors,
          sizes: values.sizes,
          keywords: values.keywords,
          product_specs: values.product_specs,
          variant_specs: values.variant_specs,
          questions: values.questions,
          offerTagId: values.offerTagId || "",
          weight: values.weight || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        storeUrl
      );

      // Displaying success message
      toast({
        title:
          data?.productId && data?.variantId
            ? "Product has been updated."
            : `Congratulations! product is now created.`,
      });

      // Redirect or Refresh data
      if (data?.productId && data?.variantId) {
        router.refresh();
      } else {
        router.push(`/dashboard/seller/stores/${storeUrl}/products`);
      }
    } catch (error: any) {
      // Handling form submission errors
      toast({
        variant: "destructive",
        title: "Oops!",
        description: error.toString(),
      });
    }
  };

  // Handle keywords input
  const [keywords, setKeywords] = useState<string[]>(data?.keywords || []);

  interface Keyword {
    id: string;
    text: string;
  }

  const handleAddition = (keyword: Keyword) => {
    if (keywords.length === 10) return;
    setKeywords([...keywords, keyword.text]);
  };

  const handleDeleteKeyword = (i: number) => {
    setKeywords(keywords.filter((_, index) => index !== i));
  };

  // Whenever colors, sizes, keywords changes we update the form values
  useEffect(() => {
    form.setValue("colors", colors);
    form.setValue("sizes", sizes);
    form.setValue("keywords", keywords);
    form.setValue("product_specs", productSpecs);
    form.setValue("variant_specs", variantSpecs);
    form.setValue("questions", questions);
  }, [colors, sizes, keywords, form, productSpecs, variantSpecs, questions]);

  return (
    <AlertDialog>
      <div className="min-h-screen bg-gradient-to-br from-form-accent via-background to-form p-6 w-full">
        <div className="mx-auto">
          <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b">
              <div className="flex items-center gap-4 p-2">
                <div className="p-3 bg-primary rounded-xl">
                  <Package2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {isNewVariantPage
                      ? `Add a new variant to ${data.name}`
                      : "Create a new product"}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {data?.productId && data.variantId
                      ? `Update ${data?.name} product information.`
                      : "Let's create a product. You can edit product later from the product page."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  {/* Images - Colors */}
                  <div
                    className={`bg-form rounded-xl border border-form-border shadow-sm transition-all duration-200 hover:shadow-md`}
                  >
                    <div className="p-6 border-b border-form-border bg-gradient-to-r from-form-accent to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {<ImageIcon className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            Product Media & Colors
                          </h3>

                          <p className="text-sm text-muted-foreground mt-1">
                            Upload product images and define available colors
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col gap-y-6 xl:flex-row">
                        <FormField
                          control={form.control}
                          name="images"
                          render={({ field }) => (
                            <FormItem className="w-full xl:border-r">
                              <FormControl>
                                <div>
                                  <ImageUpload
                                    dontShowPreview
                                    type="standard"
                                    value={field.value.map(
                                      (image) => image.url
                                    )}
                                    onChange={(url) => {
                                      setImages((prevImages) => {
                                        const updatedImages = [
                                          ...prevImages,
                                          { url },
                                        ];
                                        field.onChange(updatedImages);
                                        return updatedImages;
                                      });
                                    }}
                                    onRemove={(url) =>
                                      field.onChange([
                                        ...field.value.filter(
                                          (current) => current.url !== url
                                        ),
                                      ])
                                    }
                                  />
                                  <ImagesPreviewGrid
                                    images={form.getValues().images || []}
                                    onRemove={(url) => {
                                      const updatedImages = images.filter(
                                        (img) => img.url !== url
                                      );
                                      setImages(updatedImages);
                                      field.onChange(updatedImages);
                                    }}
                                    colors={colors}
                                    setColors={setColors}
                                  />
                                  <FormMessage className="!mt-4" />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                          <ClickToAddInputs
                            details={data?.colors || colors}
                            setDetails={setColors}
                            initialDetail={{ color: "" }}
                            header="Colors"
                            colorPicker
                          />
                          {errors.colors && (
                            <span className="text-sm font-medium text-destructive">
                              {errors.colors.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <InputFieldset
                    label="Name"
                    description="Basic product and variant information"
                    icon={<FileText className="h-5 w-5" />}
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      {!isNewVariantPage && (
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Product name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="variantName"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Variant name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </InputFieldset>

                  {/* Product - variant description editors (tabs) */}
                  <InputFieldset
                    label="Description"
                    icon={<FileText className="h-5 w-5" />}
                    description={
                      isNewVariantPage
                        ? ""
                        : "Note: The product description is the main description for the product (Will display in every variant page). You can add an extra description specific to this variant using 'Variant description' tab."
                    }
                  >
                    <Tabs
                      defaultValue={isNewVariantPage ? "variant" : "product"}
                      className="w-full"
                    >
                      {!isNewVariantPage && (
                        <TabsList className="w-full grid grid-cols-2">
                          <TabsTrigger value="product">
                            Product description
                          </TabsTrigger>
                          <TabsTrigger value="variant">
                            Variant description
                          </TabsTrigger>
                        </TabsList>
                      )}
                      <TabsContent value="product">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <JoditEditor
                                  ref={productDescEditor}
                                  value={form.getValues().description}
                                  onChange={(content) => {
                                    form.setValue("description", content);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="variant">
                        <FormField
                          control={form.control}
                          name="variantDescription"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <JoditEditor
                                  ref={variantDescEditor}
                                  value={
                                    form.getValues().variantDescription || ""
                                  }
                                  onChange={(content) => {
                                    form.setValue(
                                      "variantDescription",
                                      content
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </InputFieldset>

                  {/* Category - SubCategory - offer*/}
                  {!isNewVariantPage && (
                    <InputFieldset
                      label="Category"
                      icon={<Tag className="h-5 w-5" />}
                      description="Organize your product with categories and offers"
                    >
                      <div className="flex gap-4">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Select
                                disabled={isLoading || categories.length == 0}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      defaultValue={field.value}
                                      placeholder="Select a category"
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subCategoryId"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Select
                                disabled={
                                  isLoading ||
                                  categories.length == 0 ||
                                  !form.getValues().categoryId
                                }
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      defaultValue={field.value}
                                      placeholder="Select a sub-category"
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subCategories.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                      {sub.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Offer Tag */}
                        <FormField
                          control={form.control}
                          name="offerTagId"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Select
                                disabled={isLoading || categories.length == 0}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      defaultValue={field.value}
                                      placeholder="Select an offer"
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {offerTags &&
                                    offerTags.map((offer) => (
                                      <SelectItem
                                        key={offer.id}
                                        value={offer.id}
                                      >
                                        {offer.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </InputFieldset>
                  )}

                  {/* Brand, Sku, Weight */}
                  <InputFieldset
                    label={
                      isNewVariantPage ? "Sku, Weight" : "Brand, Sku, Weight"
                    }
                    icon={<Settings className="h-5 w-5" />}
                    description="Essential product information and specifications"
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      {!isNewVariantPage && (
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Brand</FormLabel>
                              <FormControl>
                                <Input placeholder="Product brand" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input placeholder="Product sku" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                              <NumberInput
                                defaultValue={field.value ?? undefined}
                                onValueChange={field.onChange}
                                placeholder="Product weight"
                                min={0.01}
                                step={0.01}
                                className="!shadow-none rounded-md !text-sm pl-2"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </InputFieldset>

                  {/* Variant image - Keywords*/}
                  <InputFieldset
                    icon={<ImageIcon className="h-5 w-5" />}
                    label="Variant Details"
                    description="Specific variant image and search keywords"
                  >
                    <div className="flex items-center gap-10 py-14">
                      <div className="border-r pr-10">
                        <FormField
                          control={form.control}
                          name="variantImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex justify-center">
                                Thumbnail
                              </FormLabel>
                              <FormControl>
                                <ImageUpload
                                  dontShowPreview
                                  type="profile"
                                  value={field.value.map((image) => image.url)}
                                  onChange={(url) => field.onChange([{ url }])}
                                  onRemove={(url) =>
                                    field.onChange([
                                      ...field.value.filter(
                                        (current) => current.url !== url
                                      ),
                                    ])
                                  }
                                />
                              </FormControl>
                              <FormMessage className="!mt-4" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="w-full flex-1 space-y-3">
                        <FormField
                          control={form.control}
                          name="keywords"
                          render={({ field }) => (
                            <FormItem className="relative flex-1">
                              <FormLabel>Product Keywords</FormLabel>
                              <FormControl>
                                <ReactTags
                                  handleAddition={handleAddition}
                                  handleDelete={() => {}}
                                  placeholder="Keywords (e.g., winter jacket, warm, stylish)"
                                  classNames={{
                                    tagInputField:
                                      "bg-background border rounded-md p-2 w-full focus:outline-none",
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-wrap gap-1">
                          {keywords.map((k, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="gap-2 py-1 px-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <span>{k}</span>
                              <span
                                className="cursor-pointer hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                onClick={() => handleDeleteKeyword(i)}
                              >
                                <X className="h-3 w-3" />
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </InputFieldset>

                  {/* Sizes*/}
                  <InputFieldset
                    label="Sizes, Quantities, Prices, Disocunts"
                    icon={<Scale className="h-5 w-5" />}
                    description="Configure available sizes with pricing and inventory"
                  >
                    <div className="w-full flex flex-col gap-y-3">
                      <ClickToAddInputs
                        details={sizes}
                        setDetails={setSizes}
                        initialDetail={{
                          size: "",
                          quantity: 1,
                          price: 0.01,
                          discount: 0,
                        }}
                        containerClassName="flex-1"
                        inputClassName="w-full"
                      />
                      {errors.sizes && (
                        <span className="text-sm font-medium text-destructive">
                          {errors.sizes.message}
                        </span>
                      )}
                    </div>
                  </InputFieldset>

                  {/* Product and variant specs*/}
                  <InputFieldset
                    label="Specifications"
                    icon={<FileText className="h-5 w-5" />}
                    description={
                      isNewVariantPage
                        ? ""
                        : "Note: The product specifications are the main specs for the product (Will display in every variant page). You can add extra specs specific to this variant using 'Variant Specifications' tab."
                    }
                  >
                    <Tabs
                      defaultValue={
                        isNewVariantPage ? "variantSpecs" : "productSpecs"
                      }
                      className="w-full"
                    >
                      {!isNewVariantPage && (
                        <TabsList className="w-full grid grid-cols-2">
                          <TabsTrigger value="productSpecs">
                            Product Specifications
                          </TabsTrigger>
                          <TabsTrigger value="variantSpecs">
                            Variant Specifications
                          </TabsTrigger>
                        </TabsList>
                      )}
                      <TabsContent value="productSpecs">
                        <div className="w-full flex flex-col gap-y-3">
                          <ClickToAddInputs
                            details={productSpecs}
                            setDetails={setProductSpecs}
                            initialDetail={{
                              name: "",
                              value: "",
                            }}
                            containerClassName="flex-1"
                            inputClassName="w-full"
                          />
                          {errors.product_specs && (
                            <span className="text-sm font-medium text-destructive">
                              {errors.product_specs.message}
                            </span>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="variantSpecs">
                        <div className="w-full flex flex-col gap-y-3">
                          <ClickToAddInputs
                            details={variantSpecs}
                            setDetails={setVariantSpecs}
                            initialDetail={{
                              name: "",
                              value: "",
                            }}
                            containerClassName="flex-1"
                            inputClassName="w-full"
                          />
                          {errors.variant_specs && (
                            <span className="text-sm font-medium text-destructive">
                              {errors.variant_specs.message}
                            </span>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </InputFieldset>

                  {/* Questions*/}
                  {!isNewVariantPage && (
                    <InputFieldset
                      label="Questions & Answers"
                      description="Common questions and answers about your product"
                      icon={<HelpCircle className="h-5 w-5" />}
                    >
                      <div className="w-full flex flex-col gap-y-3">
                        <ClickToAddInputs
                          details={questions}
                          setDetails={setQuestions}
                          initialDetail={{
                            question: "",
                            answer: "",
                          }}
                          containerClassName="flex-1"
                          inputClassName="w-full"
                        />
                        {errors.questions && (
                          <span className="text-sm font-medium text-destructive">
                            {errors.questions.message}
                          </span>
                        )}
                      </div>
                    </InputFieldset>
                  )}

                  {/* Is On Sale */}
                  <InputFieldset
                    icon={<Calendar className="h-5 w-5" />}
                    label="Sale"
                    description="Configure if your product is on sale"
                  >
                    <div>
                      <label
                        htmlFor="yes"
                        className="ml-5 flex items-center gap-x-2 cursor-pointer"
                      >
                        <FormField
                          control={form.control}
                          name="isSale"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <>
                                  <input
                                    type="checkbox"
                                    id="yes"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    hidden
                                  />
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span>Yes</span>
                      </label>

                      {form.getValues().isSale && (
                        <div className="mt-5">
                          <p className="text-sm text-main-secondary dark:text-gray-400 pb-3 flex">
                            <Dot className="-me-1" />
                            When sale does end ?
                          </p>
                          <div className="flex items-center gap-x-5">
                            <FormField
                              control={form.control}
                              name="saleEndDate"
                              render={({ field }) => (
                                <FormItem className="ml-4">
                                  <FormControl>
                                    <DateTimePicker
                                      className="inline-flex items-center gap-2 p-2 border rounded-md shadow-sm"
                                      calendarIcon={
                                        <span className="text-gray-500 hover:text-gray-600">
                                          📅
                                        </span>
                                      }
                                      clearIcon={
                                        <span className="text-gray-500 hover:text-gray-600">
                                          ✖️
                                        </span>
                                      }
                                      onChange={(date) => {
                                        field.onChange(
                                          date
                                            ? format(
                                                date,
                                                "yyyy-MM-dd'T'HH:mm:ss"
                                              )
                                            : ""
                                        );
                                      }}
                                      value={
                                        field.value
                                          ? new Date(field.value)
                                          : null
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <ArrowRight className="w-4 text-[#1087ff]" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </InputFieldset>

                  {/* Shipping fee method */}

                  {/* Fee Shipping */}

                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      size="lg"
                      className="min-w-48 h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                          Processing...
                        </div>
                      ) : data?.productId && data.variantId ? (
                        "Save Product Information"
                      ) : (
                        "Create Product"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AlertDialog>
  );
};

export default ProductDetails;
