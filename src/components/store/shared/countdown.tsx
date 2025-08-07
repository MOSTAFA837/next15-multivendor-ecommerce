import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useMemo } from "react";
import { SimplifiedSize } from "../product-page/info/price";

interface CountdownProps {
  targetDate: string;
  sizeId?: string;
  sizes?: SimplifiedSize[];
}

export default function Countdown({
  targetDate,
  sizeId,
  sizes,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 🧮 Calculate original and final prices based on size selection
  const { originalPrice, finalPrice } = useMemo(() => {
    if (!sizes || sizes.length === 0) {
      return { originalPrice: 0, finalPrice: 0 };
    }

    if (sizeId) {
      const selected = sizes.find((size) => size.id === sizeId);
      if (selected) {
        const final = selected.price * (1 - selected.discount / 100);
        return { originalPrice: selected.price, finalPrice: final };
      }
    }

    // If no size selected, show min price discount across all sizes
    const discountedPrices = sizes.map(
      (size) => size.price * (1 - size.discount / 100)
    );

    const minIndex = discountedPrices.indexOf(Math.min(...discountedPrices));
    const selected = sizes[minIndex];

    const final = selected.price * (1 - selected.discount / 100);
    return { originalPrice: selected.price, finalPrice: final };
  }, [sizeId, sizes]);

  // 🕒 Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(targetDate).getTime();
      const distance = end - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <Card className="relative bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
      <CardContent className="px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-red-700 font-medium">Sale ends in:</span>
          {originalPrice > finalPrice && (
            <span className=" bg-red-700 rounded-md text-sm font-bold text-white absolute -top-3 -left-3 p-2">
              Save ${(originalPrice - finalPrice).toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex gap-2 text-center">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Min", value: timeLeft.minutes },
            { label: "Sec", value: timeLeft.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-lg px-2 py-1 min-w-[50px]"
            >
              <div className="text-lg font-bold text-red-700">
                {item.value.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-red-600">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
