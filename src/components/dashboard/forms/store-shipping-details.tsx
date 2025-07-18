"use client";

// React, Next.js
import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { StoreShippingFormSchema } from "@/lib/schemas";

// UI Components
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@tremor/react";
import { Textarea } from "@/components/ui/textarea";

// Queries
import { updateStoreDefaultShippingDetails } from "@/queries/store";

// Types
import { StoreDefaultShippingType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface StoreDefaultShippingDetailsProps {
  data?: StoreDefaultShippingType;
  storeUrl: string;
}

const StoreDefaultShippingDetails: FC<StoreDefaultShippingDetailsProps> = ({
  data,
  storeUrl,
}) => {
  // Initializing necessary hooks
  const { toast } = useToast(); // Hook for displaying toast messages
  const router = useRouter(); // Hook for routing

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof StoreShippingFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(StoreShippingFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      defaultShippingService: data?.defaultShippingService || "",
      defaultShippingFeePerItem: data?.defaultShippingFeePerItem,
      defaultShippingFeeForAdditionalItem:
        data?.defaultShippingFeeForAdditionalItem,
      defaultShippingFeePerKg: data?.defaultShippingFeePerKg,
      defaultShippingFeeFixed: data?.defaultShippingFeeFixed,
      defaultDeliveryTimeMin: data?.defaultDeliveryTimeMin,
      defaultDeliveryTimeMax: data?.defaultDeliveryTimeMax,
      returnPolicy: data?.returnPolicy,
    },
  });

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  // Submit handler for form submission
  const handleSubmit = async (
    values: z.infer<typeof StoreShippingFormSchema>
  ) => {
    try {
      // Upserting category data
      const response = await updateStoreDefaultShippingDetails(storeUrl, {
        defaultShippingService: values.defaultShippingService,
        defaultShippingFeePerItem: values.defaultShippingFeePerItem,
        defaultShippingFeeForAdditionalItem:
          values.defaultShippingFeeForAdditionalItem,
        defaultShippingFeePerKg: values.defaultShippingFeePerKg,
        defaultShippingFeeFixed: values.defaultShippingFeeFixed,
        defaultDeliveryTimeMin: values.defaultDeliveryTimeMin,
        defaultDeliveryTimeMax: values.defaultDeliveryTimeMax,
        returnPolicy: values.returnPolicy,
      });

      console.log("Store updated:", response);

      if (response.id) {
        // Displaying success message
        toast({
          title: "Store Default shipping details has been updated.",
        });

        //Refresh data
        router.refresh();
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

  return (
    <AlertDialog>
      <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent pt-4">
            Store Default Shipping details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="defaultShippingService"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Shipping Service name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-4">
                <FormField
                  control={form.control}
                  name="defaultShippingFeePerItem"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Shipping fee per item</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={0}
                          step={0.1}
                          className="!pl-4 !shadow-none rounded-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultShippingFeeForAdditionalItem"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Shipping fee for additional item</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={0}
                          step={0.1}
                          className="!pl-4 !shadow-none rounded-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <FormField
                  control={form.control}
                  name="defaultShippingFeePerKg"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Shipping fee per kg</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={0}
                          step={0.1}
                          className="!pl-4 !shadow-none rounded-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultShippingFeeFixed"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Fixed Shippig fee</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={0}
                          step={0.1}
                          className="!pl-4 !shadow-none rounded-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <FormField
                  control={form.control}
                  name="defaultDeliveryTimeMin"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Minimum Delivery time (days)</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={1}
                          className="!pl-4 !shadow-none rounded-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultDeliveryTimeMax"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Maximum Delivery time (days)</FormLabel>

                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={1}
                          className="!pl-4 !shadow-none rounded-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="returnPolicy"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Return policy</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What's the return policy for your store ?"
                        className="p-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-2">
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
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default StoreDefaultShippingDetails;
