import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExtendedUser } from "@/auth";

export default function UserInfo({ user }: { user: ExtendedUser | null }) {
  const role = user?.role?.toString();

  console.log(user?.image);

  return (
    <div className=" w-full">
      <div>
        <Button
          className="w-full my-5 flex items-center justify-between"
          variant="ghost"
        >
          <div className="flex items-center text-left gap-2">
            <div className="flex flex-col gap-y-1 truncate">
              {user?.name}
              <span className="text-muted-foreground">{user?.email}</span>
              <span>
                <Badge
                  variant="secondary"
                  className="capitalize bg-blue-200 text-blue-900 border border-blue-700"
                >
                  {role?.toLocaleLowerCase()} Dashboard
                </Badge>
              </span>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
