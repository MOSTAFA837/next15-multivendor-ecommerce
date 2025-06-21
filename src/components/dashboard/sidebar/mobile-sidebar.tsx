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
import { adminDashboardSidebarOptions } from "@/constants/data";
import Logo from "@/components/shared/logo";
import UserInfo from "./user-info";
import { useCurrentuser } from "@/lib/use-current-user";
import { Menu } from "lucide-react";

export function MobileSidebar() {
  const user = useCurrentuser();
  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden">
        <Button variant="outline" className="h-12">
          <Menu className="h-5 w-5 " />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="h-screen pt-12">
        <SheetHeader>
          <Logo width="80%" height="80px" />
          <span className="mt-3" />

          {user && <UserInfo user={user} />}
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />
        </div>
        {/* <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
