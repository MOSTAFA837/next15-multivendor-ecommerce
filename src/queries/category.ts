"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/use-current-user";
import { Category } from "@prisma/client";

export const upsertCategory = async (category: Category) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");

    if (user.role !== "ADMIN")
      throw new Error(
        "Unauthorized Access: Admin Privileges Required for Entry."
      );

    console.log(category);

    if (!category) throw new Error("Please provide category data.");

    const existingCategory = await db.category.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: category.name }, { url: category.url }],
          },
          {
            NOT: {
              id: category.id,
            },
          },
        ],
      },
    });

    // Throw error if category with same name or URL already exists
    if (existingCategory) {
      let errorMessage = "";
      if (existingCategory.name === category.name) {
        errorMessage = "A category with the same name already exists";
      } else if (existingCategory.url === category.url) {
        errorMessage = "A category with the same URL already exists";
      }
      throw new Error(errorMessage);
    }

    // Upsert category into the database
    const categoryDetails = await db.category.upsert({
      where: {
        id: category.id,
      },
      update: {
        name: category.name,
        url: category.url,
        featured: category.featured ?? false,
        updatedAt: new Date(),
      },
      create: {
        id: category.id,
        name: category.name,
        url: category.url,
        featured: category.featured ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return categoryDetails;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllCategories = async () => {
  const categories = await db.category.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: { subCategories: true },
  });

  return categories;
};

export const getCategory = async (categoryId: string) => {
  // Ensure category ID is provided
  if (!categoryId) throw new Error("Please provide category ID.");

  // Retrieve category
  const category = await db.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  return category;
};

export const deleteCategory = async (categoryId: string) => {
  // Get current user
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) throw new Error("Unauthenticated.");

  // Verify admin permission
  if (user.role !== "ADMIN")
    throw new Error(
      "Unauthorized Access: Admin Privileges Required for Entry."
    );

  // Ensure category ID is provided
  if (!categoryId) throw new Error("Please provide category ID.");

  // Delete category from the database
  const response = await db.category.delete({
    where: {
      id: categoryId,
    },
  });
  return response;
};

export const getCategoriesWithSubCategories = async (categoryId: string) => {
  const categories = db.category.findMany({
    where: {
      id: categoryId,
    },
    include: {
      subCategories: true,
    },
  });

  return categories;
};
