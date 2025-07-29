"use server";

import { db } from "@/lib/db";
import {
  OrderTableDateFilter,
  OrderTableFilter,
  PaymentTableDateFilter,
  PaymentTableFilter,
  ReviewDateFilter,
  ReviewFilter,
} from "@/lib/types";
import { currentUser } from "@/lib/use-current-user";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { subMonths, subYears } from "date-fns";

export const getUserOrders = async (
  filter: OrderTableFilter = "",
  period: OrderTableDateFilter = "",
  search = "",
  page: number = 1,
  pageSize: number = 1
) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");

  const skip = (page - 1) * pageSize;

  // base query
  const whereClause: any = {
    AND: [{ userId: user.id }],
  };

  // apply filters
  if (filter === "unpaid")
    whereClause.AND.push({ paymentStatus: PaymentStatus.Pending });
  if (filter === "toShip")
    whereClause.AND.push({ orderStatus: OrderStatus.Processing });
  if (filter === "shipped")
    whereClause.AND.push({ orderStatus: OrderStatus.Shipped });
  if (filter === "delivered")
    whereClause.AND.push({ orderStatus: OrderStatus.Delivered });

  // apply period filter
  const now = new Date();
  if (period === "last-6-months") {
    whereClause.AND.push({
      createdAt: { gte: subMonths(now, 6) },
    });
  }
  if (period === "last-1-year") {
    whereClause.AND.push({
      createdAt: { gte: subYears(now, 1) },
    });
  }
  if (period === "last-2-years") {
    whereClause.AND.push({
      createdAt: { gte: subYears(now, 2) },
    });
  }

  if (search.trim()) {
    whereClause.AND.push({
      OR: [
        { id: { contains: search } },
        {
          groups: {
            some: {
              store: {
                name: { contains: search },
              },
            },
          },
        },
        {
          groups: {
            some: {
              items: {
                some: {
                  name: { contains: search },
                },
              },
            },
          },
        },
      ],
    });
  }

  const orders = await db.order.findMany({
    where: whereClause,
    include: {
      groups: {
        include: {
          items: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      },
    },
    take: pageSize,
    skip,
    orderBy: {
      updatedAt: "desc",
    },
  });

  // total count of orders for the query
  const totalCount = await db.order.count({ where: whereClause });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    orders,
    totalPages,
    currentPage: page,
    pageSize,
    totalCount,
  };
};

export const getUserPayments = async (
  filter: PaymentTableFilter = "",
  period: PaymentTableDateFilter = "",
  search = "" /* Search by Payment intent id */,
  page: number = 1,
  pageSize: number = 10
) => {
  // Retrieve current user
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) throw new Error("Unauthenticated.");

  // Calculate pagination values
  const skip = (page - 1) * pageSize;

  // Construct the base query
  const whereClause: any = {
    AND: [
      {
        userId: user.id,
      },
    ],
  };

  // Apply filters
  if (filter === "paypal") whereClause.AND.push({ paymentMethod: "Paypal" });
  if (filter === "credit-card")
    whereClause.AND.push({ paymentMethod: "Stripe" });

  // Apply period filter
  const now = new Date();
  if (period === "last-6-months") {
    whereClause.AND.push({
      createdAt: { gte: subMonths(now, 6) },
    });
  }
  if (period === "last-1-year")
    whereClause.AND.push({ createdAt: { gte: subYears(now, 1) } });
  if (period === "last-2-years")
    whereClause.AND.push({ createdAt: { gte: subYears(now, 2) } });

  // Apply search filter
  if (search.trim()) {
    whereClause.AND.push({
      OR: [
        {
          id: { contains: search }, // Search by ID
        },
        {
          paymentInetntId: { contains: search }, // Search by Payment intent ID
        },
      ],
    });
  }

  // Fetch payments for the current page
  const payments = await db.paymentDetails.findMany({
    where: whereClause,
    include: {
      order: true,
    },
    take: pageSize, // Limit to page size
    skip, // Skip the orders of previous pages
    orderBy: {
      updatedAt: "desc", // Sort by most updated recently
    },
  });

  // Fetch total count of orders for the query
  const totalCount = await db.paymentDetails.count({ where: whereClause });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Return paginated data with metadata
  return {
    payments,
    totalPages,
    currentPage: page,
    pageSize,
    totalCount,
  };
};

export const getUserReviews = async (
  filter: ReviewFilter = "",
  period: ReviewDateFilter = "",
  search = "" /* Search by Payment intent id */,
  page: number = 1,
  pageSize: number = 10
) => {
  // Retrieve current user
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) throw new Error("Unauthenticated.");

  // Calculate pagination values
  const skip = (page - 1) * pageSize;

  // Construct the base query
  const whereClause: any = {
    AND: [
      {
        userId: user.id,
      },
    ],
  };

  // Apply filters
  if (filter) whereClause.AND.push({ rating: parseFloat(filter) });

  // Apply period filter
  const now = new Date();
  if (period === "last-6-months") {
    whereClause.AND.push({
      createdAt: { gte: subMonths(now, 6) },
    });
  }
  if (period === "last-1-year")
    whereClause.AND.push({ createdAt: { gte: subYears(now, 1) } });
  if (period === "last-2-years")
    whereClause.AND.push({ createdAt: { gte: subYears(now, 2) } });

  // Apply search filter
  if (search.trim()) {
    whereClause.AND.push({
      review: { contains: search }, // Search by review text
    });
  }

  // Fetch reviews for the current page
  const reviews = await db.review.findMany({
    where: whereClause,
    include: {
      user: true,
    },
    take: pageSize, // Limit to page size
    skip, // Skip the orders of previous pages
    orderBy: {
      updatedAt: "desc", // Sort by most updated recently
    },
  });

  // Fetch total count of orders for the query
  const totalCount = await db.review.count({ where: whereClause });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Return paginated data with metadata
  return {
    reviews,
    totalPages,
    currentPage: page,
    pageSize,
    totalCount,
  };
};
