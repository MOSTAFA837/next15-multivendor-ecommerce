"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  ShoppingBag,
  CreditCard,
  MapPin,
  Star,
  Clock,
  Heart,
  Users,
  ChevronRight,
  Home,
} from "lucide-react";

const menuIcons = {
  "/profile": <User className="w-4 h-4" />,
  "/profile/orders": <ShoppingBag className="w-4 h-4" />,
  "/profile/payment": <CreditCard className="w-4 h-4" />,
  "/profile/addresses": <MapPin className="w-4 h-4" />,
  "/profile/reviews": <Star className="w-4 h-4" />,
  "/profile/history/1": <Clock className="w-4 h-4" />,
  "/profile/wishlist/1": <Heart className="w-4 h-4" />,
  "/profile/following/1": <Users className="w-4 h-4" />,
};

export default function ProfileSidebar() {
  const pathname = usePathname();
  const path = pathname.split("/profile/")[1];
  const pathTrim = path ? path.split("/")[0] : null;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              href="/"
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link
              href="/profile"
              className="hover:text-foreground transition-colors"
            >
              Account
            </Link>
            {pathname !== "/profile" && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium capitalize">
                  {pathTrim || path}
                </span>
              </>
            )}
          </nav>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Account</h2>
            <Badge variant="secondary" className="text-xs">
              Profile
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <nav className="space-y-1 p-2">
            {menu.map((item, index) => {
              const isActive =
                item.link &&
                (pathname === item.link ||
                  (pathname.startsWith(item.link) && item.link !== "/profile"));

              return (
                <Link key={item.link} href={item.link}>
                  <div
                    className={cn(
                      "group relative flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-primary/5 hover:text-primary",
                      {
                        "bg-primary text-primary-foreground shadow-sm":
                          isActive,
                        "text-muted-foreground": !isActive,
                      }
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={cn(
                          "transition-colors",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-primary"
                        )}
                      >
                        {menuIcons[item.link as keyof typeof menuIcons]}
                      </span>
                      <span>{item.title}</span>
                    </div>
                    {isActive && (
                      <div className="w-1 h-4 bg-primary-foreground rounded-full opacity-80" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}

const menu = [
  { title: "Overview", link: "/profile" },
  { title: "Orders", link: "/profile/orders" },
  { title: "Payment", link: "/profile/payment" },
  { title: "Shipping address", link: "/profile/addresses" },
  { title: "Reviews", link: "/profile/reviews" },
  { title: "History", link: "/profile/history/1" },
  { title: "Wishlist", link: "/profile/wishlist/1" },
  { title: "Following", link: "/profile/following/1" },
];
