import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default function AssurancePolicy() {
  const assuranceItems = [
    {
      icon: ShieldCheck,
      title: "Safe payments",
      description: "Payment methods used by many international shoppers",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Lock,
      title: "Security & privacy",
      description: "We respect your privacy so your personal details are safe",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: ShieldAlert,
      title: "Buyer protection",
      description:
        "Get your money back if your order isn't delivered by estimated date or if you're not satisfied with your order",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm border-0 bg-gradient-to-br from-slate-50 to-white">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary font-medium px-3 py-1"
          >
            GoShop Assurance
          </Badge>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {assuranceItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="group flex items-start gap-4 p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer bg-white/50 hover:bg-white"
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
              >
                <IconComponent className={`w-5 h-5 ${item.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
