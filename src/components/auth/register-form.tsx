"use client";

import { useForm } from "react-hook-form";
import CardWrapper from "./card-wrapper";
import { z } from "zod";
import { registerSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useTransition } from "react";
import { register } from "@/queries/user";
import { User, Mail, Lock, Zap, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      register(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <CardWrapper
      headerlabel="Create an account"
      backButtonHref="/auth/login"
      backButtonLabel="Already have an account?"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* NAME FIELD */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
                  <div className="bg-green-500 border-2 border-black p-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="ENTER YOUR NAME"
                    className="h-14 text-lg font-bold uppercase placeholder:font-bold placeholder:text-gray-500 border-4 border-black bg-gray-50 focus:border-blue-500 focus:ring-0"
                  />
                </FormControl>
                <FormMessage className="bg-red-500 border-4 border-black p-3 transform -rotate-1 text-white font-black uppercase text-sm" />
              </FormItem>
            )}
          />

          {/* EMAIL FIELD */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
                  <div className="bg-purple-500 border-2 border-black p-1">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="YOUR@EMAIL.COM"
                    type="email"
                    className="h-14 text-lg font-bold uppercase placeholder:font-bold placeholder:text-gray-500 border-4 border-black bg-gray-50 focus:border-blue-500 focus:ring-0"
                  />
                </FormControl>
                <FormMessage className="bg-red-500 border-4 border-black p-3 transform rotate-1 text-white font-black uppercase text-sm" />
              </FormItem>
            )}
          />

          {/* PASSWORD FIELD */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
                  <div className="bg-red-500 border-2 border-black p-1">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="SUPER SECRET"
                    className="h-14 text-lg font-bold uppercase placeholder:font-bold placeholder:text-gray-500 border-4 border-black bg-gray-50 focus:border-blue-500 focus:ring-0"
                  />
                </FormControl>
                <FormMessage className="bg-red-500 border-4 border-black p-3 transform -rotate-1 text-white font-black uppercase text-sm" />
              </FormItem>
            )}
          />

          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            className="w-full h-16 bg-green-500 hover:bg-green-600 border-4 border-black text-white font-black text-xl uppercase tracking-wide transform hover:translate-x-1 hover:translate-y-1 transition-all duration-200 shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000]"
          >
            Create an account
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
