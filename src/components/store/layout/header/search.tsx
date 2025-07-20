"use client";

import { SearchIcon } from "lucide-react";

export default function Search() {
  return (
    <div className="relative max-w-[600px] flex-1">
      <form className="h-10 w-full rounded-3xl bg-white relative border flex">
        <input
          type="text"
          placeholder="Search..."
          className="bg-white text-black flex-1 border-none pl-2.5 m-2.5 outline-none"
        />

        <button
          type="submit"
          className="border-[1px] rounded-[20px] w-[56px] h-8 mt-1 mr-1 mb-0 ml-0 text-black bg-gradient-to-r from-gray-100 bg-gray-300 hover:text-black/70 grid place-items-center cursor-pointer"
        >
          <SearchIcon />
        </button>
      </form>
    </div>
  );
}
