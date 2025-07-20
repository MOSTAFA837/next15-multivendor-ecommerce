"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import Link from "next/link";
import { useCurrentuser } from "@/lib/use-current-user";

import UserMenu from "./user-menu";
import Wishlist from "./wishlist";
import MobileNav from "./mobile-nav";
import Search from "./search";
import Cart from "./cart";

const Header = () => {
  const user = useCurrentuser();

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl  "
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20 ">
          <MobileNav />

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="text-xl font-bold tracking-tight text-zinc-900"
          >
            <Link href="/">ALEX.com</Link>
          </motion.div>

          <Search />

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <Wishlist />

            <Cart />

            {user ? (
              <UserMenu />
            ) : (
              <Link href="/auth/login" className="relative">
                <User className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
