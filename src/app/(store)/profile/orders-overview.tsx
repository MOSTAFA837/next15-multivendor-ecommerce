import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  MessageSquare,
  DollarSign,
  Clock,
  Truck,
  Package,
  CheckCircle,
  CreditCard,
} from "lucide-react";

export default function OrdersOverview() {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">My Orders</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="/profile/orders"
              className="text-primary hover:text-primary/80"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {menu.map((item) => (
            <Link key={item.link} href={item.link}>
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 border-0 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
                <CardContent className="p-4 text-center">
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm text-foreground mb-1">
                      {item.title}
                    </h3>
                    {item.count && (
                      <Badge variant="secondary" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="space-y-3">
          <Link href="/profile/appeals">
            <Card className="group cursor-pointer transition-all duration-200 hover:shadow-sm border-0 bg-gradient-to-r from-orange-50 to-orange-25">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        My Appeals
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your order appeals
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/disputes">
            <Card className="group cursor-pointer transition-all duration-200 hover:shadow-sm border-0 bg-gradient-to-r from-red-50 to-red-25">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        In Dispute
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Track dispute status
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

const menu = [
  {
    title: "Unpaid",
    icon: CreditCard,
    link: "/profile/orders/unpaid",
    count: "2",
  },
  {
    title: "To be shipped",
    icon: Clock,
    link: "/profile/orders/toShip",
    count: "1",
  },
  {
    title: "Shipped",
    icon: Truck,
    link: "/profile/orders/shipped",
    count: "3",
  },
  {
    title: "Delivered",
    icon: CheckCircle,
    link: "/profile/orders/delivered",
    count: "15",
  },
];
