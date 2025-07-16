"use client";

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
import { ProductFormSchema } from "@/lib/schemas";
import { ProductWithVariantType } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@prisma/client";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputFieldset from "../shared/input-fieldset";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProductDetailsProps {
  data?: Partial<ProductWithVariantType>;
  categories: Category[];
  storeUrl: string;
}

export default function ProductDetails({
  data,
  categories,
  storeUrl,
}: ProductDetailsProps) {
  const form = useForm<z.infer<typeof ProductFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: data?.name,
    },
  });

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  // extract errors and loading states from form
  const isLoading = form.formState.isSubmitting;

  const handleSubmit = async (values: z.infer<typeof ProductFormSchema>) => {
    console.log("values", values);
  };

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            {data?.productId && data.variantId
              ? `Update ${data?.name} product information.`
              : " Lets create a product. You can edit product later from the product page."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Name */}
              <InputFieldset label="Name">
                <div className="flex flex-col lg:flex-row gap-4">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </InputFieldset>

              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.productId && data.variantId
                  ? "Save product information"
                  : "Create product"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}
