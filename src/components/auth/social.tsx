import React from "react";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";

import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export default function Social() {
  return (
    <div className="w-full">
      <Button
        size="lg"
        onClick={() => signIn("google", { redirectTo: DEFAULT_LOGIN_REDIRECT })}
        className="w-full border-4 border-black bg-white text-black font-black uppercase tracking-wide text-lg h-14 transform hover:translate-x-1 hover:translate-y-1 transition-all duration-200 shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000]"
        variant="outline"
      >
        <div className="flex items-center justify-center gap-3">
          {/* <img
            src="/google-icon.svg" // make sure you have this icon or replace with a Google icon component
            alt="Google"
            className="w-5 h-5"
          /> */}
          Sign in with Google
        </div>
      </Button>
    </div>
  );
}
