import { auth } from "@/auth";
import { useSession } from "next-auth/react";

// client side hook to get the current user
export const useCurrentuser = () => {
  const session = useSession();

  return session.data?.user;
};

// server side function to get the current user
export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};
