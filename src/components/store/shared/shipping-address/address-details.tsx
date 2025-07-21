"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShippingAddressSchema } from "@/lib/schemas";
import { UserShippingAddressType } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { v4 } from "uuid";
import { upsertShippingAddress } from "@/queries/user";
import { Button } from "@/components/ui/button";

interface Props {
  data?: UserShippingAddressType;
  setShow: Dispatch<SetStateAction<boolean>>;
}

export default function AddressDetails({ setShow, data }: Props) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof ShippingAddressSchema>>({
    mode: "onChange",
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: {
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      address1: data?.address1 ?? "",
      address2: data?.address2 ?? "",
      city: data?.city ?? "",
      phone: data?.phone ?? "",
      state: data?.state ?? "",
      zip_code: data?.zip_code ?? "",
      default: data?.default ?? false,
    },
  });

  const isLoading = form.formState.isSubmitting;

  console.log("data", data);

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        address2: data.address2 || "",
      });
    }
  }, [data, form]);

  console.log("data2", data);

  const handleSubmit = async (
    values: z.infer<typeof ShippingAddressSchema>
  ) => {
    try {
      await upsertShippingAddress({
        id: data?.id ? data.id : v4(),
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        address1: values.address1,
        address2: values.address2 || "",
        city: values.city,
        state: values.state,
        default: values.default || false,
        zip_code: values.zip_code,
        userId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast({
        title: data?.id
          ? "Shipping address has been updated."
          : `Congratulations! Shipping address is now created.`,
      });

      router.refresh();
      setShow(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oops!",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error),
      });
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Contact information</FormLabel>
            <div className="flex flex-col md:flex-row gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="First name*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Last name*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex-1 md:w-[calc(50%-8px)] !mt-3">
                  <FormControl>
                    <Input placeholder="Phone number*" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <div className="!mt-3 flex flex-col gap-3">
              <FormField
                control={form.control}
                name="address1"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Street, house/apartment/unit*"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address2"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Apt, suite, unit, etc (optional）"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="!mt-3 flex items-center justify-between gap-3">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="State*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="City*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="zip_code"
              render={({ field }) => (
                <FormItem className="flex-1 w-[calc(50%-8px)] !mt-3">
                  <FormControl>
                    <Input placeholder="Zip code*" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="rounded-md">
            {isLoading
              ? "loading..."
              : data?.id
              ? "Save address information"
              : "Create address"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
