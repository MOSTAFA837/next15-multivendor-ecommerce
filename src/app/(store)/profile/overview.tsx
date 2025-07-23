import { currentUser } from "@/lib/use-current-user";
import { Heart, Eye, Puzzle, Rss, WalletCards, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ProfileOverview() {
  const user = await currentUser();
  if (!user) return null;

  return (
    <Card className="border-0 shadow-lg  bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r pt-3 rounded-md from-primary/10 to-primary/5 border-b">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-0.5">
              <Image
                src={user.image || "/images/avatar.png"}
                alt={user.name!}
                width={200}
                height={200}
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground capitalize">
              {user.name?.toLowerCase()}
            </h1>
            <p className="text-muted-foreground text-sm">Member since 2024</p>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {menu.map((item) => (
            <Link key={item.link} href={item.link}>
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-4 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const menu = [
  {
    title: "Wishlist",
    icon: <Heart className="w-5 h-5" />,
    link: "/profile/wishlist",
    badge: "12",
  },
  {
    title: "Following",
    icon: <Rss className="w-5 h-5" />,
    link: "/profile/following/1",
    badge: "8",
  },
  {
    title: "Viewed",
    icon: <Eye className="w-5 h-5" />,
    link: "/profile/history/1",
  },
  {
    title: "Coupons",
    icon: <Puzzle className="w-5 h-5" />,
    link: "/profile/coupons",
    badge: "3",
  },
  {
    title: "Shopping credit",
    icon: <WalletCards className="w-5 h-5" />,
    link: "/profile/credit",
  },
];
