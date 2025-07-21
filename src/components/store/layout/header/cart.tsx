"use client";

import Link from "next/link";
import { CartIcon } from "../../icons";
import { useCartStore } from "@/cart/use-cart";

export default function Cart() {
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <div className="relative flex h-11 items-center px-2 cursor-pointer">
      <Link href="/cart" className="flex items-center">
        <span className="text-[32px] inline-block">
          <CartIcon />
        </span>

        <div className="min-h-3 min-w-6 -mt-1.5 absolute right-0 -top-1">
          <span className="inline-block text-xs  leading-4 text-white text-center font-bold w-4 rounded-full px-1 h-4 bg-blue-600">
            {totalItems}
          </span>
        </div>
      </Link>
    </div>
  );
}
