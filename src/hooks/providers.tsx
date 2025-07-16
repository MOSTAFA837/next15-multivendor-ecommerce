// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import ModalProvider from "@/providers/modal-provider";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      <ModalProvider>{children}</ModalProvider>
      <Toaster />
    </SessionProvider>
  );
}
