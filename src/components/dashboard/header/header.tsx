import { MobileSidebar } from "../sidebar/mobile-sidebar";

export default function Header({ isAdmin }: { isAdmin?: boolean }) {
  return (
    <div className="fixed z-[20] lg:left-[300px] left-0 top-0 right-0 p-4 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px]">
      <div className="flex justify-center items-center gap-2 ml-auto">
        <MobileSidebar isAdmin />
      </div>
    </div>
  );
}
