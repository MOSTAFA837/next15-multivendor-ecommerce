"use server";

import { loginSchema, registerSchema } from "@/schemas";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { currentUser } from "@/lib/use-current-user";
import { CartProductType } from "@/lib/types";
import { getShippingDetails } from "./product";

export const login = async (values: z.infer<typeof loginSchema>) => {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password!" };
        default:
          return { error: "An unexpected error occurred!" };
      }
    }

    throw error; // Re-throw if it's not an AuthError
  }
};

export const register = async (values: z.infer<typeof registerSchema>) => {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "User already exists with this email!" };
  }

  await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return { success: "Email sent" };
};

export const logOut = async () => {
  await signOut();
};

export const followStore = async (storeId: string): Promise<boolean> => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated");

    const store = await db.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) throw new Error("Store not found.");

    // Check if the user exists
    const userData = await db.user.findUnique({
      where: {
        id: user.id,
      },
    });
    if (!userData) throw new Error("User not found.");

    // Check if the user is already following the store
    const userFollowingStore = await db.user.findFirst({
      where: {
        id: user.id,
        following: {
          some: {
            id: storeId,
          },
        },
      },
    });

    if (userFollowingStore) {
      // Unfollow the store and return false
      await db.store.update({
        where: {
          id: storeId,
        },
        data: {
          followers: {
            disconnect: { id: userData.id },
          },
        },
      });
      return false;
    } else {
      // Follow the store and return true
      await db.store.update({
        where: {
          id: storeId,
        },
        data: {
          followers: {
            connect: {
              id: userData.id,
            },
          },
        },
      });
      return true;
    }
  } catch (error) {
    throw error;
  }
};

export const saveUserCart = async (
  cartProducts: CartProductType[]
): Promise<boolean> => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");

  const userId = user.id;

  const userCart = await db.cart.findFirst({ where: { userId } });

  if (userCart) {
    await db.cart.delete({
      where: {
        userId,
      },
    });
  }

  const validatedCartItems = await Promise.all(
    cartProducts.map(async (cartProduct) => {
      const { productId, variantId, sizeId, quantity } = cartProduct;

      const product = await db.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          store: true,

          variants: {
            where: {
              id: variantId,
            },
            include: {
              sizes: {
                where: {
                  id: sizeId,
                },
              },
              images: true,
            },
          },
        },
      });

      if (
        !product ||
        product.variants.length === 0 ||
        product.variants[0].sizes.length === 0
      ) {
        throw new Error(
          `Invalid product, variant, or size combination for productId ${productId}, variantId ${variantId}, sizeId ${sizeId}`
        );
      }

      const variant = product.variants[0];
      const size = variant.sizes[0];

      const validQty = Math.min(quantity, size.quantity);

      const price = size.discount
        ? size.price - size.price * (size.discount / 100)
        : size.price;

      let details = {
        shippingFee: 0,
        extraShippingFee: 0,
      };

      const temp_details = await getShippingDetails(
        product.shippingFeeMethod,
        product.store
      );

      if (typeof temp_details !== "boolean") {
        details = temp_details;
      }

      let shippingFee = 0;
      const { shippingFeeMethod } = product;
      if (shippingFeeMethod === "ITEM") {
        shippingFee =
          quantity === 1
            ? details.shippingFee
            : details.shippingFee + details.extraShippingFee * (quantity - 1);
      } else if (shippingFeeMethod === "WIGHT") {
        shippingFee = details.shippingFee * (variant.weight ?? 0) * quantity;
      } else if (shippingFeeMethod === "FIXED") {
        shippingFee = details.shippingFee;
      }

      const totalPrice = price * validQty + shippingFee;
      return {
        productId,
        variantId,
        productSlug: product.slug,
        variantSlug: variant.slug,
        sizeId,
        storeId: product.storeId,
        sku: variant.sku,
        name: `${product.name} · ${variant.variantName}`,
        image: variant.images[0].url,
        size: size.size,
        quantity: validQty,
        price,
        shippingFee,
        totalPrice,
      };
    })
  );

  // Recalculate the cart's total price and shipping fees
  const subTotal = validatedCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shippingFees = validatedCartItems.reduce(
    (acc, item) => acc + item.shippingFee,
    0
  );

  const total = subTotal + shippingFees;

  // Save the validated items to the cart in the database
  const cart = await db.cart.create({
    data: {
      items: {
        create: validatedCartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          storeId: item.storeId,
          sku: item.sku,
          productSlug: item.productSlug,
          variantSlug: item.variantSlug,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
          shippingFee: item.shippingFee,
          totalPrice: item.totalPrice,
        })),
      },
      shippingFees,
      subTotal,
      total,
      user: {
        connect: { id: userId },
      },
    },
  });

  if (cart) return true;
  return false;
};
