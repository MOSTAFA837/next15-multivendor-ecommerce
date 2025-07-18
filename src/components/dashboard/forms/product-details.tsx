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
  Palette,
  Scale,
  Settings,
  Tag,
  X,
} from "lucide-react";
import { generateRandomSKU } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import JoditEditor from "jodit-react";
import { NumberInput } from "@tremor/react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";

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
          weight: values.weight,
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

  const FormSection: React.FC<{
    icon: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ icon, title, description, children, className = "" }) => (
    <div
      className={`bg-form rounded-xl border border-form-border shadow-sm transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="p-6 border-b border-form-border bg-gradient-to-r from-form-accent to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const KeywordTag: React.FC<{ keyword: string; onRemove: () => void }> = ({
    keyword,
    onRemove,
  }) => (
    <Badge
      variant="secondary"
      className="gap-2 py-1 px-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
    >
      {keyword}
      <button
        type="button"
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );

  return (
    <AlertDialog>
      <div className="min-h-screen bg-gradient-to-br from-form-accent via-background to-form p-6 w-full">
        <div className="mx-auto">
          <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b">
              <div className="flex items-center gap-4 p-4">
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

            <CardContent className="p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-8"
                >
                  {/* Images & Colors Section */}
                  <FormSection
                    icon={<ImageIcon className="h-5 w-5" />}
                    title="Product Media & Colors"
                    description="Upload product images and define available colors"
                  >
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Images */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="images"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">
                                Product Images
                              </FormLabel>
                              <FormControl>
                                <div className="space-y-4">
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
                                  <ImageUpload
                                    dontShowPreview
                                    type="standard"
                                    value={field.value.map(
                                      (image) => image.url
                                    )}
                                    onChange={(url) => {
                                      const updatedImages = [
                                        ...images,
                                        { url },
                                      ];
                                      setImages(updatedImages);
                                      field.onChange(updatedImages);
                                    }}
                                    onRemove={(url) =>
                                      field.onChange([
                                        ...field.value.filter(
                                          (current) => current.url !== url
                                        ),
                                      ])
                                    }
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Colors */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Palette className="h-4 w-4 text-primary" />
                          <span className="text-base font-medium">
                            Available Colors
                          </span>
                        </div>
                        <ClickToAddInputs
                          details={data?.colors || colors}
                          setDetails={setColors}
                          initialDetail={{ color: "" }}
                          header="Colors"
                          colorPicker
                        />
                        {errors.colors && (
                          <p className="text-sm text-destructive">
                            {errors.colors.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <FormField
                          control={form.control}
                          name="variantImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Variant Image</FormLabel>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </FormSection>

                  {/* Product Names Section */}
                  <FormSection
                    icon={<FileText className="h-5 w-5" />}
                    title="Product Information"
                    description="Basic product and variant information"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      {!isNewVariantPage && (
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter product name"
                                  {...field}
                                  className="h-12"
                                />
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
                          <FormItem>
                            <FormLabel>Variant Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter variant name"
                                {...field}
                                className="h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-6" />

                    {/* Descriptions */}
                    <Tabs defaultValue="product" className="w-full">
                      <TabsList className="w-full h-12 bg-muted/50">
                        <TabsTrigger value="product" className="flex-1 h-10">
                          Product Description
                        </TabsTrigger>
                        <TabsTrigger value="variant" className="flex-1 h-10">
                          Variant Description
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="product" className="mt-6">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <JoditEditor
                                  ref={productDescEditor}
                                  value={form.getValues().description}
                                  onChange={(content) =>
                                    form.setValue("description", content)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="variant" className="mt-6">
                        <FormField
                          control={form.control}
                          name="variantDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <JoditEditor
                                  ref={variantDescEditor}
                                  value={form.getValues().variantDescription}
                                  onChange={(content) =>
                                    form.setValue("variantDescription", content)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </FormSection>

                  {/* Category Section */}
                  {!isNewVariantPage && (
                    <FormSection
                      icon={<Tag className="h-5 w-5" />}
                      title="Product Categorization"
                      description="Organize your product with categories and offers"
                    >
                      <div className="grid md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select
                                disabled={isLoading || categories.length === 0}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select a category" />
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
                            <FormItem>
                              <FormLabel>Sub-Category</FormLabel>
                              <Select
                                disabled={
                                  isLoading ||
                                  categories.length === 0 ||
                                  !form.getValues().categoryId
                                }
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select a sub-category" />
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

                        <FormField
                          control={form.control}
                          name="offerTagId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Offer Tag</FormLabel>
                              <Select
                                disabled={isLoading || categories.length === 0}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select an offer" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {offerTags?.map((offer) => (
                                    <SelectItem key={offer.id} value={offer.id}>
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
                    </FormSection>
                  )}

                  {/* Product Details Section */}
                  <FormSection
                    icon={<Settings className="h-5 w-5" />}
                    title={
                      isNewVariantPage
                        ? "Product Details"
                        : "Brand & Product Details"
                    }
                    description="Essential product information and specifications"
                  >
                    <div className="grid md:grid-cols-3 gap-6">
                      {!isNewVariantPage && (
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brand</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter brand name"
                                  {...field}
                                  className="h-12"
                                />
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
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter product SKU"
                                {...field}
                                className="h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <NumberInput
                                defaultValue={field.value}
                                onValueChange={field.onChange}
                                placeholder="0.00"
                                min={0.01}
                                step={0.01}
                                className="h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormSection>

                  {/* Variant Image & Keywords Section */}
                  <FormSection
                    icon={<ImageIcon className="h-5 w-5" />}
                    title="Variant Details"
                    description="Specific variant image and search keywords"
                  >
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="keywords"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Keywords</FormLabel>
                              <FormControl>
                                <ReactTags
                                  handleAddition={handleAddition}
                                  autofocus={false}
                                  handleDelete={() => {}}
                                  placeholder="Add keywords (e.g., winter jacket, warm, stylish)"
                                  classNames={{
                                    tagInputField:
                                      "bg-background border rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-primary/20",
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {keywords.map((keyword, index) => (
                              <KeywordTag
                                key={index}
                                keyword={keyword}
                                onRemove={() => handleDeleteKeyword(index)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </FormSection>

                  {/* Sizes & Pricing Section */}
                  <FormSection
                    icon={<Scale className="h-5 w-5" />}
                    title="Sizes, Quantities & Pricing"
                    description="Configure available sizes with pricing and inventory"
                  >
                    <ClickToAddInputs
                      details={sizes}
                      setDetails={setSizes}
                      initialDetail={{
                        size: "",
                        quantity: 1,
                        price: 0.01,
                        discount: 0,
                      }}
                      containerClassName="w-full"
                      inputClassName="w-full"
                    />
                    {errors.sizes && (
                      <p className="text-sm text-destructive mt-2">
                        {errors.sizes.message}
                      </p>
                    )}
                  </FormSection>

                  {/* Specifications Section */}
                  <FormSection
                    icon={<FileText className="h-5 w-5" />}
                    title="Product Specifications"
                    description="Detailed technical specifications for product and variants"
                  >
                    <Tabs className="w-full" defaultValue="productSpecs">
                      <TabsList className="w-full h-12 bg-muted/50">
                        <TabsTrigger
                          value="productSpecs"
                          className="flex-1 h-10"
                        >
                          Product Specifications
                        </TabsTrigger>
                        <TabsTrigger
                          value="variantSpecs"
                          className="flex-1 h-10"
                        >
                          Variant Specifications
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="productSpecs" className="mt-6">
                        <ClickToAddInputs
                          details={productSpecs}
                          setDetails={setProductSpecs}
                          initialDetail={{ name: "", value: "" }}
                        />
                        {errors.product_specs && (
                          <p className="text-sm text-destructive mt-2">
                            {errors.product_specs.message}
                          </p>
                        )}
                      </TabsContent>

                      <TabsContent value="variantSpecs" className="mt-6">
                        <ClickToAddInputs
                          details={variantSpecs}
                          setDetails={setVariantSpecs}
                          initialDetail={{ name: "", value: "" }}
                        />
                        {errors.variant_specs && (
                          <p className="text-sm text-destructive mt-2">
                            {errors.variant_specs.message}
                          </p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </FormSection>

                  {/* Q&A Section */}
                  <FormSection
                    icon={<HelpCircle className="h-5 w-5" />}
                    title="Questions & Answers"
                    description="Common questions and answers about your product"
                  >
                    <ClickToAddInputs
                      details={questions}
                      setDetails={setQuestions}
                      initialDetail={{
                        question: "",
                        answer: "",
                      }}
                      containerClassName="w-full"
                      inputClassName="w-full"
                    />
                    {errors.questions && (
                      <p className="text-sm text-destructive mt-2">
                        {errors.questions.message}
                      </p>
                    )}
                  </FormSection>

                  {/* Sale Settings Section */}
                  <FormSection
                    icon={<Calendar className="h-5 w-5" />}
                    title="Sale Configuration"
                    description="Configure if your product is on sale"
                  >
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="isSale"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                              </FormControl>
                              <FormLabel className="text-base font-medium cursor-pointer">
                                This product is on sale
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.getValues().isSale && (
                        <div className="bg-form-accent rounded-lg p-6 border border-form-border">
                          <div className="flex items-center gap-2 mb-4">
                            <Dot className="text-primary" />
                            <span className="text-sm font-medium">
                              When does the sale end?
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <FormField
                              control={form.control}
                              name="saleEndDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <DateTimePicker
                                      className="inline-flex items-center gap-2 p-3 border rounded-md shadow-sm h-12 bg-background"
                                      calendarIcon={
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                      }
                                      clearIcon={
                                        <X className="h-4 w-4 text-muted-foreground" />
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

                            <ArrowRight className="h-4 w-4 text-primary" />

                            <div className="bg-primary/10 px-4 py-2 rounded-lg">
                              <span className="text-sm font-medium text-primary">
                                {formattedDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormSection>

                  {/* Submit Button */}
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
