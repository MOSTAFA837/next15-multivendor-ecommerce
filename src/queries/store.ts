"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/use-current-user";
import { StoreStatus } from "@prisma/client"; // Ensure this matches your enums
import { v4 as uuidv4 } from "uuid";

type StoreInput = {
  id?: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  logo: string;
  cover: string;
  url: string;
  featured?: boolean;
  status?: StoreStatus;
  averageRating?: number;
  returnPolicy?: string | null;
  defaultShippingService?: string | null;
  defaultShippingFees?: number | null;
  defaultDeliveryTimeMin?: number | null;
  defaultDeliveryTimeMax?: number | null;
};

export const upsertStore = async (store: StoreInput) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");
    if (user.role !== "SELLER")
      throw new Error("Unauthorized Access: Seller Privileges Required.");

    if (!store) throw new Error("Please provide store data.");

    const existingStore = await db.store.findFirst({
      where: {
        AND: [
          {
            OR: [
              { name: store.name },
              { email: store.email },
              { phone: store.phone },
              { url: store.url },
            ],
          },
          {
            NOT: { id: store.id ?? "" },
          },
        ],
      },
    });

    if (existingStore) {
      if (existingStore.name === store.name)
        throw new Error("A store with the same name already exists");
      if (existingStore.email === store.email)
        throw new Error("A store with the same email already exists");
      if (existingStore.phone === store.phone)
        throw new Error("A store with the same phone number already exists");
      if (existingStore.url === store.url)
        throw new Error("A store with the same URL already exists");
    }

    const storeDetails = await db.store.upsert({
      where: {
        id: store.id ?? "", // Try find by store ID
      },
      update: {
        ...store,
        updatedAt: new Date(),
      },
      create: {
        id: store.id ?? uuidv4(),
        name: store.name,
        description: store.description,
        email: store.email,
        phone: store.phone,
        logo: store.logo,
        cover: store.cover,
        url: store.url,
        status: store.status ?? StoreStatus.PENDING,
        featured: store.featured ?? false,
        averageRating: store.averageRating ?? 0,
        returnPolicy: store.returnPolicy ?? null,
        defaultShippingService: store.defaultShippingService ?? null,
        defaultShippingFees: store.defaultShippingFees ?? null,
        defaultDeliveryTimeMin: store.defaultDeliveryTimeMin ?? null,
        defaultDeliveryTimeMax: store.defaultDeliveryTimeMax ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.id ?? "",
      },
    });

    return storeDetails;
  } catch (error) {
    throw error;
  }
};
