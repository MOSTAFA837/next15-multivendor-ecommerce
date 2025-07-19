"use server";

import { Role } from "@prisma/client";
import { currentUser } from "./use-current-user";

export const checkUserRole = async (role: Role) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated");

  if (user.role !== role) {
    throw new Error(
      `Unauthorized Access: ${role} Privileges Required for Entry.`
    );
  }

  return user;
};
