"use client";
import ColorWheel from "@/components/shared/color-wheel";
import { ReviewWithImageType } from "@/lib/types";
import Image from "next/image";
import ReactStars from "react-rating-stars-component";

export default function ReviewCard({
  review,
}: {
  review: ReviewWithImageType;
}) {
  const { user } = review;

  const { name } = user;
  const cesnoredName =
    name && name.length > 1
      ? `${name[0]}***${name[name.length - 1]}`
      : "Anonymous";
  return (
    <div className="border border-[#d8d8d8] rounded-xl flex h-fit relative py-4 px-2.5">
      <div className="w-16 px- space-y-1">
        <Image
          src={user?.image || "/images/avatar.png"}
          alt="Profile image"
          width={100}
          height={100}
          className="w-11 h-11 rounded-full object-cover"
        />
        <span className="text-xs text-main-secondary">
          {cesnoredName.toUpperCase()}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between leading-5 overflow-hidden px-1.5">
        <div className="space-y-2">
          <ReactStars
            count={5}
            size={24}
            color="#F5F5F5"
            activeColor="#FFD804"
            value={review.rating}
            isHalf
            edit={false}
          />
          <div className="flex items-center gap-x-2">
            <div className="text-main-secondary text-sm">{review.variant}</div>
            <span>.</span>
            <div className="text-main-secondary text-sm">{review.size}</div>
            <span>.</span>
          </div>
          <p className="text-sm">{review.review}</p>
        </div>
      </div>
    </div>
  );
}
