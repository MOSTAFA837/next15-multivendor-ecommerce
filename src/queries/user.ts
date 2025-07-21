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
import {
  getDeliveryDetailsForStoreByCountry,
  getShippingDetails,
} from "./product";
import { ShippingAddress } from "@prisma/client";
import { cookies } from "next/headers";

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

export const getUserShippingAddresses = async () => {
  try {
    // Get current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Retrieve all shipping addresses for the specified user
    const shippingAddresses = await db.shippingAddress.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    return shippingAddresses;
  } catch (error) {
    // Log and re-throw any errors
    throw error;
  }
};

export const upsertShippingAddress = async (address: ShippingAddress) => {
  try {
    // Get current user
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    // Ensure address data is provided
    if (!address) throw new Error("Please provide address data.");

    // Handle making the rest of addresses default false when we are adding a new default
    if (address.default) {
      const addressDB = await db.shippingAddress.findUnique({
        where: { id: address.id },
      });
      if (addressDB) {
        try {
          await db.shippingAddress.updateMany({
            where: {
              userId: user.id,
              default: true,
            },
            data: {
              default: false,
            },
          });
        } catch (error) {
          throw new Error("Could not reset default shipping addresses");
        }
      }
    }

    // Upsert shipping address into the database
    const upsertedAddress = await db.shippingAddress.upsert({
      where: {
        id: address.id,
      },
      update: {
        ...address,
        userId: user.id,
      },
      create: {
        ...address,
        userId: undefined, // Remove userId to avoid conflict with user relation
        user: {
          connect: { id: user.id },
        },
      },
    });

    return upsertedAddress;
  } catch (error) {
    throw error;
  }
};

export const placeOrder = async (
  shippingAddress: ShippingAddress,
  cartId: string
): Promise<{ orderId: string }> => {
  // Ensure the user is authenticated
  const user = await currentUser();
  if (!user || !user.id) throw new Error("Unauthenticated.");

  const userId: string = user.id;

  // Fetch user's cart with all items
  const cart = await db.cart.findUnique({
    where: {
      id: cartId,
    },
    include: {
      items: true,
    },
  });

  if (!cart) throw new Error("Cart not found.");

  const cartItems = cart.items;

  // Fetch product, variant, and size data from the database for validation
  const validatedCartItems = await Promise.all(
    cartItems.map(async (cartProduct) => {
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

  // Define the type for grouped items by store
  type GroupItems = { [storeId: string]: typeof validatedCartItems };

  // Group validated items by store
  const groupedItems = validatedCartItems.reduce<GroupItems>((acc, item) => {
    if (!acc[item.storeId]) acc[item.storeId] = [];

    acc[item.storeId].push(item);
    return acc;
  }, {} as GroupItems);

  console.log("groupedItems", groupedItems);

  // Create the order
  const order = await db.order.create({
    data: {
      userId: userId,
      shippingAddressId: shippingAddress.id,
      orderStatus: "Pending",
      paymentStatus: "Pending",
      subTotal: 0, // Will calculate below
      shippingFees: 0, // Will calculate below
      total: 0, // Will calculate below
    },
  });

  // Iterate over each store's items and create OrderGroup and OrderItems
  let orderTotalPrice = 0;
  let orderShippingFee = 0;

  for (const [storeId, items] of Object.entries(groupedItems)) {
    // Calculate store-specific totals
    const groupedTotalPrice = items.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    const groupShippingFees = items.reduce(
      (acc, item) => acc + item.shippingFee,
      0
    );

    const { shippingService, deliveryTimeMin, deliveryTimeMax } =
      await getDeliveryDetailsForStoreByCountry(storeId);

    // Create an OrderGroup for this store
    const orderGroup = await db.orderGroup.create({
      data: {
        orderId: order.id,
        storeId: storeId,
        status: "Pending",
        subTotal: groupedTotalPrice - groupShippingFees,
        shippingFees: groupShippingFees,
        total: groupedTotalPrice,
        shippingService: shippingService || "International Delivery",
        shippingDeliveryMin: deliveryTimeMin || 7,
        shippingDeliveryMax: deliveryTimeMax || 30,
      },
    });

    // Create OrderItems for this OrderGroup
    for (const item of items) {
      await db.orderItem.create({
        data: {
          orderGroupId: orderGroup.id,
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          productSlug: item.productSlug,
          variantSlug: item.variantSlug,
          sku: item.sku,
          name: item.name,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          shippingFee: item.shippingFee,
          totalPrice: item.totalPrice,
        },
      });
    }

    // Update order totals
    orderTotalPrice += groupedTotalPrice;
    orderShippingFee += groupShippingFees;
  }

  // Update the main order with the final totals
  await db.order.update({
    where: {
      id: order.id,
    },
    data: {
      subTotal: orderTotalPrice - orderShippingFee,
      shippingFees: orderShippingFee,
      total: orderTotalPrice,
    },
  });

  // Delete cart

  // await db.cart.delete({
  //   where: {
  //     id: cartId,
  //   },
  // });

  return {
    orderId: order.id,
  };
};

export const emptyUserCart = async () => {
  try {
    // Ensure the user is authenticated
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");

    const userId = user.id;

    const res = await db.cart.delete({
      where: {
        userId,
      },
    });
    if (res) return true;
  } catch (error) {
    throw error;
  }
};

export const updateCartWithLatest = async (
  cartProducts: CartProductType[]
): Promise<CartProductType[]> => {
  // Fetch product, variant, and size data from the database for validation
  const validatedCartItems = await Promise.all(
    cartProducts.map(async (cartProduct) => {
      const { productId, variantId, sizeId, quantity } = cartProduct;

      // Fetch the product, variant, and size from the database
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

      let details = {
        shippingService: product.store.defaultShippingService,
        shippingFee: 0,
        extraShippingFee: 0,
        deliveryTimeMin: 0,
        deliveryTimeMax: 0,
      };

      const temp_details = await getShippingDetails(
        product.shippingFeeMethod,
        product.store
      );

      if (typeof temp_details !== "boolean") {
        details = temp_details;
      }

      const price = size.discount
        ? size.price - (size.price * size.discount) / 100
        : size.price;

      const validated_qty = Math.min(quantity, size.quantity);

      return {
        productId,
        variantId,
        productSlug: product.slug,
        variantSlug: variant.slug,
        sizeId,
        sku: variant.sku,
        name: product.name,
        variantName: variant.variantName,
        image: variant.images[0].url,
        variantImage: variant.variantImage,
        stock: size.quantity,
        weight: variant.weight,
        shippingMethod: product.shippingFeeMethod,
        size: size.size,
        quantity: validated_qty,
        price,
        shippingService: details.shippingService,
        shippingFee: details.shippingFee,
        extraShippingFee: details.extraShippingFee,
        deliveryTimeMin: details.deliveryTimeMin,
        deliveryTimeMax: details.deliveryTimeMax,
      };
    })
  );
  return validatedCartItems;
};
