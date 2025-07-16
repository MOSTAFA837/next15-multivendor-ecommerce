"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SidebarNavAdmin from "./nav-admin";
import {
  adminDashboardSidebarOptions,
  SellerDashboardSidebarOptions,
} from "@/constants/data";
import Logo from "@/components/shared/logo";
import UserInfo from "./user-info";
import { useCurrentuser } from "@/lib/use-current-user";
import { Menu } from "lucide-react";

interface Props {
  isAdmin?: boolean;
}

export function MobileSidebar({ isAdmin }: Props) {
  const user = useCurrentuser();
  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden cursor-pointer">
        <Button variant="outline" className="h-12">
          <Menu className="h-5 w-5 " />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="h-screen pt-12">
        <SheetHeader>
          {/* <Logo width="80%" height="80px" />
          <span className="mt-3" /> */}

          {user && <UserInfo user={user} />}
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          {isAdmin ? (
            <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />
          ) : (
            <SidebarNavAdmin menuLinks={SellerDashboardSidebarOptions} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
