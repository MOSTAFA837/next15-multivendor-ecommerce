import { Button } from "@/components/ui/button";
import {
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Sheet,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function MobileNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Women", href: "/women" },
    { label: "Men", href: "/men" },
    { label: "Kids", href: "/kids" },
    { label: "Home", href: "/home" },
    { label: "Beauty", href: "/beauty" },
    { label: "Sport", href: "/sport" },
    { label: "Vendors", href: "/vendors" },
  ];

  return (
    <div className="lg:hidden">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 px-6">
          <SheetHeader>
            <SheetTitle className="text-lg">Browse</SheetTitle>
            <SheetDescription className="text-sm">
              Navigate through categories
            </SheetDescription>
          </SheetHeader>
          <nav className="mt-6 space-y-4">
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="block text-base font-medium text-zinc-700 hover:text-black transition"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
