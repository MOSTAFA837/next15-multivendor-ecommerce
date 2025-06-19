import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExtendedUser } from "@/auth";

export default function UserInfo({ user }: { user: ExtendedUser | null }) {
  const role = user?.role?.toString();

  return (
    <div>
      <div>
        <Button
          className="w-full mt-5 mb-4 flex items-center justify-between py-10"
          variant="ghost"
        >
          <div className="flex items-center text-left gap-2">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={user?.image || ""}
                alt={`${user?.name || ""} `}
              />
              <AvatarFallback className="bg-primary text-white">
                {user?.name}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-y-1 truncate">
              {user?.name}
              <span className="text-muted-foreground">{user?.email}</span>
              <span className="w-fit">
                <Badge variant="secondary" className="capitalize">
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
