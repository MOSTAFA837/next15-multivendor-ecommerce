"use client";

import { FiltersQueryType } from "@/lib/types";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type RawQueries = FiltersQueryType | Promise<any> | string;

function normalizeFilters(input: any): FiltersQueryType {
  if (!input) return {} as FiltersQueryType;
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch {
      return {} as FiltersQueryType;
    }
  }
  return input as FiltersQueryType;
}

export default function FiltersHeader({ queries }: { queries: RawQueries }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [resolvedQueries, setResolvedQueries] = useState<FiltersQueryType>(
    {} as FiltersQueryType
  );
  const [currentParams, setCurrentParams] = useState<string>(
    searchParams.toString()
  );

  // Resolve potentially async / stringified queries
  useEffect(() => {
    let cancelled = false;
    Promise.resolve(queries)
      .then((q) => {
        if (cancelled) return;
        setResolvedQueries(normalizeFilters(q));
      })
      .catch((err) => {
        console.error("Failed to resolve queries:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [queries]);

  // Sync currentParams when URL changes
  useEffect(() => {
    setCurrentParams(searchParams.toString());
  }, [searchParams]);

  // Memoized entries and derived counts
  const queriesArray = useMemo(
    () => Object.entries(resolvedQueries),
    [resolvedQueries]
  );

  const queriesLength = useMemo(() => {
    return queriesArray.reduce((count, [queryKey, queryValue]) => {
      if (queryKey === "sort") return count; // Exclude sort from the count
      if (queryKey === "search" && queryValue === "") return count; // Exclude empty search
      if (Array.isArray(queryValue)) {
        return count + queryValue.length;
      }
      return count + 1;
    }, 0);
  }, [queriesArray]);

  // Clear all filters
  const handleClearQueries = () => {
    replace(pathname);
  };

  // Remove specific query or value
  const handleRemoveQuery = (
    query: string,
    array?: string[],
    specificValue?: string
  ) => {
    const params = new URLSearchParams(searchParams);

    if (specificValue && array) {
      const updatedArray = array.filter((v) => v !== specificValue);
      params.delete(query);
      updatedArray.forEach((v) => params.append(query, v));
    } else {
      params.delete(query);
    }

    replace(`${pathname}?${params.toString()}`);
    setCurrentParams(params.toString());
  };

  return (
    <div className="pt-2.5 pb-5">
      <div className="flex items-center justify-between h-4 leading-5">
        <div className="text-sm font-bold">Filter ({queriesLength})</div>
        {queriesLength > 0 && (
          <div
            className="text-xs text-orange-background cursor-pointer hover:underline"
            onClick={handleClearQueries}
          >
            Clear All
          </div>
        )}
      </div>

      {/* Display filters */}
      <div className="mt-3 flex flex-wrap gap-2">
        {queriesArray.map(([queryKey, queryValue]) => {
          if (queryKey === "sort") return null;
          if (queryKey === "search" && queryValue === "") return null;

          const isArrayQuery = Array.isArray(queryValue);
          const queryValues = isArrayQuery
            ? (queryValue as string[])
            : [queryValue as string];

          return (
            <div key={queryKey} className="flex flex-wrap gap-2">
              {queryValues.map((value, index) => (
                <div
                  key={index}
                  className="border cursor-pointer py-0.5 px-1.5 rounded-sm text-sm w-fit text-center flex items-center gap-1"
                >
                  <span className="text-main-secondary overflow-hidden text-ellipsis whitespace-nowrap">
                    {value}
                  </span>
                  <X
                    className="w-3 text-main-secondary hover:text-black cursor-pointer"
                    onClick={() => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                      isArrayQuery
                        ? handleRemoveQuery(queryKey, queryValues, value)
                        : handleRemoveQuery(queryKey);
                    }}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
