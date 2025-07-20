"use client";

import { motion } from "framer-motion";
import { User, Package, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useCurrentuser } from "@/lib/use-current-user";
import { MessageIcon, OrderIcon, WishlistIcon } from "../../icons";

export default function UserMenu() {
  const user = useCurrentuser();

  const handleLogout = () => {
    signOut();
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full focus-visible:ring-0"
          >
            <Image
              src={user?.image ?? "/default-profile.png"}
              alt="profile"
              width={200}
              height={200}
              className="object-cover rounded-full shadow-2xl"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-fit mt-2">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Account
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="flex gap-3">
            {links.map((item) => (
              <DropdownMenuItem asChild key={item.title}>
                <Link
                  href={item.link}
                  className="flex items-center gap-2 w-full "
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 moving-gradient flex items-center justify-center rounded-full text-white">
                    {item.icon}
                  </div>
                  <span className="text-xs mt-1">{item.title}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="bg-gray-200" />

          {extraLinks.map((item) => (
            <DropdownMenuItem asChild key={item.title}>
              <Link href={item.link} className="flex items-center gap-2 w-full">
                {item.title}
              </Link>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="bg-gray-200" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

const links = [
  {
    icon: <OrderIcon />,
    title: "Orders",
    link: "/profile/orders",
  },
  {
    icon: <MessageIcon />,
    title: "Messages",
    link: "/profile/messages",
  },
  {
    icon: <WishlistIcon />,
    title: "WishList",
    link: "/profile/wishlist",
  },
];

const extraLinks = [
  {
    title: "Profile",
    link: "/profile",
  },
  {
    title: "Settings",
    link: "/",
  },
  {
    title: "Become a Seller",
    link: "/become-seller",
  },
  {
    title: "Help Center",
    link: "",
  },
  {
    title: "Return & Refund Policy",
    link: "/",
  },
  {
    title: "Legal & Privacy",
    link: "",
  },
  {
    title: "Discounts & Offers",
    link: "",
  },
  {
    title: "Order Dispute Resolution",
    link: "",
  },
  {
    title: "Report a Problem",
    link: "",
  },
];
