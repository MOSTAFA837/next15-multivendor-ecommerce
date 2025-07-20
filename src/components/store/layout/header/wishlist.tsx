"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function Wishlist() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Link href="/" className="relative">
        <Heart className="w-7 h-7" />
        <span className="absolute -top-3 -right-2 text-[10px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
          3
        </span>
      </Link>
    </motion.div>
  );
}
