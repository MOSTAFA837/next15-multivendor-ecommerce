"use server";

import { db } from "@/lib/db";
import { OrderTableDateFilter, OrderTableFilter } from "@/lib/types";
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
