import OrdersOverview from "./orders-overview";
import ProfileOverview from "./overview";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileOverview />
      <OrdersOverview />
    </div>
  );
}
