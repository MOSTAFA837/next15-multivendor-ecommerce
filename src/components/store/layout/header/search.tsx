"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useState } from "react";

export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const { push, replace } = useRouter();

  const search_query_url = params.get("search");

  const [searchQuery, setSearchQuery] = useState<string>(
    search_query_url || ""
  );

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (pathname !== "/browse") {
      // We are not in browse page
      push(`/browse?search=${searchQuery}`);
    } else {
      // We are in browse page
      if (!searchQuery) {
        params.delete("search");
      } else {
        params.set("search", searchQuery);
      }
      replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (pathname === "/browse") return;

    if (value.length >= 2) {
      await fetch(`/api/search-products?search=${value}`);
    }
  };

  return (
    <div className="relative max-w-[600px] flex-1">
      <form
        onSubmit={handleSubmit}
        className="h-10 w-full rounded-3xl bg-white relative border flex"
      >
        <input
          type="text"
          placeholder="Search..."
          className="bg-white text-black flex-1 border-none pl-2.5 m-2.5 outline-none"
          value={searchQuery}
          onChange={handleInputChange}
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
