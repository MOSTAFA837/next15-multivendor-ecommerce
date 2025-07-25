"use server";

// DB
import { db } from "@/lib/db";
import {
  CountryWithShippingRatesType,
  StoreDefaultShippingType,
  StoreStatus,
  StoreType,
} from "@/lib/types";

// Clerk

// Prisma models
import { ShippingRate, Store } from "@prisma/client";
// import { checkIfUserFollowingStore } from "./product";
import { currentUser } from "@/lib/use-current-user";

// Function: upsertStore
// Description: Upserts store details into the database, ensuring uniqueness of name,url, email, and phone number.
// Access Level: Seller Only
// Parameters:
//   - store: Partial store object containing details of the store to be upserted.
// Returns: Updated or newly created store details.
export const upsertStore = async (store: Partial<Store>) => {
  try {
    // Get current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Verify seller permission
    if (user.role !== "SELLER")
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );

    // Ensure store data is provided
    if (!store) throw new Error("Please provide store data.");

    // Check if store with same name, email,url, or phone number already exists
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
            NOT: {
              id: store.id,
            },
          },
        ],
      },
    });

    // If a store with same name, email, or phone number already exists, throw an error
    if (existingStore) {
      let errorMessage = "";
      if (existingStore.name === store.name) {
        errorMessage = "A store with the same name already exists";
      } else if (existingStore.email === store.email) {
        errorMessage = "A store with the same email already exists";
      } else if (existingStore.phone === store.phone) {
        errorMessage = "A store with the same phone number already exists";
      } else if (existingStore.url === store.url) {
        errorMessage = "A store with the same URL already exists";
      }
      throw new Error(errorMessage);
    }

    // Upsert store details into the database
    /*
    const storeDetails = await db.store.upsert({
      where: {
        id: store.id,
      },
      update: store,
      create: {
        ...store,
        user: {
          connect: { id: user.id },
        },
      },
    });

    return storeDetails;
  */
  } catch (error) {
    throw error;
  }
};

// Function: getStoreDefaultShippingDetails
// Description: Fetches the default shipping details for a store based on the store URL.
// Parameters:
//   - storeUrl: The URL of the store to fetch default shipping details for.
// Returns: An object containing default shipping details, including shipping service, fees, delivery times, and return policy.
export const getStoreDefaultShippingDetails = async (storeUrl: string) => {
  try {
    // Ensure the store URL is provided
    if (!storeUrl) throw new Error("Store URL is required.");

    // Fetch the store and its default shipping details
    const store = await db.store.findUnique({
      where: {
        url: storeUrl,
      },
      select: {
        defaultShippingService: true,
        defaultShippingFeePerItem: true,
        defaultShippingFeeForAdditionalItem: true,
        defaultShippingFeePerKg: true,
        defaultShippingFeeFixed: true,
        defaultDeliveryTimeMin: true,
        defaultDeliveryTimeMax: true,
        returnPolicy: true,
      },
    });

    // Throw an error if the store is not found
    if (!store) throw new Error("Store not found.");

    return store;
  } catch (error) {
    // Log and re-throw any errors
    throw error;
  }
};

// Function: updateStoreDefaultShippingDetails
// Description: Updates the default shipping details for a store based on the store URL.
// Parameters:
//   - storeUrl: The URL of the store to update.
//   - details: An object containing the new shipping details (shipping service, fees, delivery times, and return policy).
// Returns: The updated store object with the new default shipping details.
export const updateStoreDefaultShippingDetails = async (
  storeUrl: string,
  details: StoreDefaultShippingType
) => {
  try {
    // Get current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Verify seller permission
    if (user.role !== "SELLER")
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );

    // Ensure the store URL is provided
    if (!storeUrl) throw new Error("Store URL is required.");

    // Ensure at least one detail is provided for update
    if (!details) {
      throw new Error("No shipping details provided to update.");
    }
    // Make sure seller is updating their own store
    const check_ownership = await db.store.findUnique({
      where: {
        url: storeUrl,
        userId: user.id,
      },
    });

    if (!check_ownership)
      throw new Error(
        "Make sure you have the permissions to update this store"
      );

    console.log("details", details);

    // Find and update the store based on storeUrl
    const updatedStore = await db.store.update({
      where: {
        url: storeUrl,
        userId: user.id,
      },
      data: details,
    });

    console.log("updatedStore", updatedStore);

    return updatedStore;
  } catch (error) {
    // Log and re-throw any errors
    throw error;
  }
};

/**
 * Function: getStoreShippingRates
 * Description: Retrieves all countries and their shipping rates for a specific store.
 *              If a country does not have a shipping rate, it is still included in the result with a null shippingRate.
 * Permission Level: Public
 * Returns: Array of objects where each object contains a country and its associated shippingRate, sorted by country name.
 */
export const getStoreShippingRates = async (storeUrl: string) => {
  try {
    // Get current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Verify seller permission
    if (user.role !== "SELLER")
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );

    // Ensure the store URL is provided
    if (!storeUrl) throw new Error("Store URL is required.");

    // Make sure seller is updating their own store
    const check_ownership = await db.store.findUnique({
      where: {
        url: storeUrl,
        userId: user.id,
      },
    });

    if (!check_ownership)
      throw new Error(
        "Make sure you have the permissions to update this store"
      );

    // Get store details
    const store = await db.store.findUnique({
      where: { url: storeUrl, userId: user.id },
    });

    if (!store) throw new Error("Store could not be found.");

    // Retrieve all countries
    const countries = await db.country.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Retrieve all shipping rates for the specified store
    const shippingRates = await db.shippingRate.findMany({
      where: {
        storeId: store.id,
      },
    });

    // Create a map for quick lookup of shipping rates by country ID
    const rateMap = new Map();
    shippingRates.forEach((rate) => {
      rateMap.set(rate.countryId, rate);
    });

    // Map countries to their shipping rates
    const result = countries.map((country) => ({
      countryId: country.id,
      countryName: country.name,
      shippingRate: rateMap.get(country.id) || null,
    }));

    return result;
  } catch (error) {
    throw error;
  }
};

// Function: upsertShippingRate
// Description: Upserts a shipping rate for a specific country, updating if it exists or creating a new one if not.
// Permission Level: Seller only
// Parameters:
//   - storeUrl: Url of the store you are trying to update.
//   - shippingRate: ShippingRate object containing the details of the shipping rate to be upserted.
// Returns: Updated or newly created shipping rate details.
export const upsertShippingRate = async (
  storeUrl: string,
  shippingRate: ShippingRate
) => {
  console.log("shippingRate---1", shippingRate);
  try {
    // Get current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Verify seller permission
    if (user.role !== "SELLER")
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );

    // Make sure seller is updating their own store
    const check_ownership = await db.store.findUnique({
      where: {
        url: storeUrl,
        userId: user.id,
      },
    });

    if (!check_ownership)
      throw new Error(
        "Make sure you have the permissions to update this store"
      );

    // Ensure shipping rate data is provided
    if (!shippingRate) throw new Error("Please provide shipping rate data.");

    // Ensure countryId is provided
    if (!shippingRate.countryId)
      throw new Error("Please provide a valid country ID.");

    // Get store id
    const store = await db.store.findUnique({
      where: {
        url: storeUrl,
        userId: user.id,
      },
    });
    if (!store) throw new Error("Please provide a valid store URL.");

    console.log("shippingRate", shippingRate);

    // Upsert the shipping rate into the database
    const shippingRateDetails = await db.shippingRate.upsert({
      where: {
        id: shippingRate.id,
      },
      update: {
        ...shippingRate,
        storeId: store.id,
        shippingService: shippingRate.shippingService || "Default",
      },
      create: { ...shippingRate, storeId: store.id },
    });

    return shippingRateDetails;
  } catch (error) {
    // Log and re-throw any errors
    throw error;
  }
};

// Function: getAllStores
// Description: Retrieves all stores from the database.
// Permission Level: Admin only
// Parameters: None
// Returns: An array of store details.

export const updateStoreStatus = async (
  storeId: string,
  status: StoreStatus
) => {
  // Retrieve current user
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) throw new Error("Unauthenticated.");

  // Verify admin permission
  if (user.role !== "ADMIN")
    throw new Error(
      "Unauthorized Access: Admin Privileges Required for Entry."
    );

  const store = await db.store.findUnique({
    where: {
      id: storeId,
    },
  });

  // Verify seller ownership
  if (!store) {
    throw new Error("Store not found !");
  }

  // Retrieve the order to be updated
  const updatedStore = await db.store.update({
    where: {
      id: storeId,
    },
    data: {
      status,
    },
  });

  // Update the user role
  if (store.status === "PENDING" && updatedStore.status === "ACTIVE") {
    await db.user.update({
      where: {
        id: updatedStore.userId,
      },
      data: {
        role: "SELLER",
      },
    });
  }

  return updatedStore.status;
};

// Function: deleteStore
// Description: Deletes a store from the database.
// Permission Level: Admin only
// Parameters:
//   - storeId: The ID of the store to be deleted.
// Returns: Response indicating success or failure of the deletion operation.
export const deleteStore = async (storeId: string) => {
  try {
    // Get current user
    const user = await currentUser();

    // Check if user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Verify admin permission
    if (user.role !== "ADMIN")
      throw new Error(
        "Unauthorized Access: Admin Privileges Required for Entry."
      );

    // Ensure store ID is provided
    if (!storeId) throw new Error("Please provide store ID.");

    // Delete store from the database
    const response = await db.store.delete({
      where: {
        id: storeId,
      },
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const getStorePageDetails = async (storeUrl: string) => {
  const user = await currentUser();

  // Fetch the store details from the database
  const store = await db.store.findUnique({
    where: {
      url: storeUrl,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,
      cover: true,
      averageRating: true,
      numReviews: true,
    },
  });

  // Handle case where the store is not found
  if (!store) {
    throw new Error(`Store with URL "${storeUrl}" not found.`);
  }
  return { ...store };
};

export const getStoreFollowingInfo = async (storeId: string) => {
  const user = await currentUser();
  let isUserFollowingStore = false;

  if (user) {
    const storeFollowers = await db.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        followers: {
          where: {
            id: user.id,
          },
          select: { id: true },
        },
      },
    });

    if (storeFollowers && storeFollowers.followers.length > 0) {
      isUserFollowingStore = true;
    }
  }

  const storeFollowersInfo = await db.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      _count: {
        select: {
          followers: true,
        },
      },
    },
  });
  return {
    isUserFollowingStore,
    followersCount: storeFollowersInfo
      ? storeFollowersInfo._count.followers
      : 0,
  };
};
