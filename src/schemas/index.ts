import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const registerSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(6, "Minimum 6 characters required"),
  name: z.string().min(1, { message: "Name is required" }),
});
