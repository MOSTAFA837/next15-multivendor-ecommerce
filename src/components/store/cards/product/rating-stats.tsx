"use client";
import { StatisticsCardType } from "@/lib/types";
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
} from "react";
import ReactStars from "react-rating-stars-component";

export default function RatingStatisticsCard({
  statistics,
}: {
  statistics: StatisticsCardType;
}) {
  return (
    <div className="w-full h-44 flex-1">
      <div className="py-5 px-7 bg-[#f5f5f5] flex flex-col gap-y-2 h-full justify-center overflow-hidden rounded-lg">
        {statistics
          .slice()
          .reverse()
          .map(
            (rating: {
              rating: Key | null | undefined;
              percentage: any;
              numReviews:
                | string
                | number
                | bigint
                | boolean
                | ReactElement<unknown, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | ReactPortal
                | Promise<
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactPortal
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | null
                    | undefined
                  >
                | null
                | undefined;
            }) => (
              <div key={rating.rating} className="flex items-center h-4">
                <ReactStars
                  count={5}
                  value={typeof rating.rating === "number" ? rating.rating : 0}
                  size={15}
                  color="#e2dfdf"
                  isHalf
                  edit={false}
                />
                <div className="relative w-full flex-1 h-1.5 mx-2.5 bg-[#e2dfdf] rounded-full">
                  <div
                    className="absolute left-0 h-full rounded-full bg-[#ffc50A]"
                    style={{ width: `${rating.percentage}%` }}
                  />
                </div>
                <div className="text-xs w-12 leading-4">
                  {rating.numReviews}
                </div>
              </div>
            )
          )}
      </div>
    </div>
  );
}
