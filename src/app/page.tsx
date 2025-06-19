"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { useCurrentuser } from "@/lib/use-current-user";

export default function SettingsPage() {
  const user = useCurrentuser();

  const onClick = () => {
    signOut();
  };

  return (
    <div>
      {JSON.stringify(user)}

      <button className="w-full cursor-pointer" onClick={onClick}>
        Sign Out
      </button>
    </div>
  );
}
