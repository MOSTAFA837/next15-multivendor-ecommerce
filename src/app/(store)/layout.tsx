import CategoriesHeader from "@/components/store/layout/categories-header";
import Footer from "@/components/store/layout/footer";
import Header from "@/components/store/layout/header/header";
import { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
