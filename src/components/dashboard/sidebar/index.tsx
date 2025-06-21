import { FC } from "react";

import Logo from "@/components/shared/logo";
import {
  adminDashboardSidebarOptions,
  SellerDashboardSidebarOptions,
} from "@/constants/data";
import { currentUser } from "@/lib/use-current-user";
import UserInfo from "./user-info";
import SidebarNavAdmin from "./nav-admin";

// import UserInfo from "./user-info";
// import SidebarNavAdmin from "./nav-admin";
// import { Store } from "@prisma/client";
// import SidebarNavSeller from "./nav-seller";
// import StoreSwitcher from "./store-switcher";
// import { currentUser } from "@/lib/use-current-user";

interface SidebarProps {
  isAdmin?: boolean;
  //   stores?: Store[];
}

const Sidebar: FC<SidebarProps> = async ({ isAdmin }) => {
  const user = await currentUser();

  return (
    <div className="border-r-black border-r-2 pt-9 w-[300px] justify-between hidden h-full lg:flex flex-col fixed top-0 left-0 bottom-0">
      <Logo width="100%" height="140px" />
      <span className="mt-3" />

      {user && <UserInfo user={user} />}

      {/* {!isAdmin && stores && <StoreSwitcher stores={stores} />} */}

      {isAdmin ? (
        <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />
      ) : (
        <>SidebarNavSeller</>
      )}
    </div>
  );
};
export default Sidebar;
