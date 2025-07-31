import { FiltersQueryType } from "@/lib/types";
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
import CategoryFilter from "./filters/category/category-filter";
import OfferFilter from "./filters/offer/offer-filter";

export default async function ProductFilters({
  queries,
  storeUrl,
}: {
  queries: FiltersQueryType;
  storeUrl?: string;
}) {
  const categories = await getAllCategories(storeUrl);
  const offers = await getAllOfferTags(storeUrl);

  return (
    <div className="h-full w-48 transition-transform overflow-auto pr-6 pb-2.5 flex-none basis-[196px] overflow-x-hidden scrollbar">
      <div className="border-t w-40 md:w-44">
        <CategoryFilter categories={categories} />
        <OfferFilter offers={offers} />
      </div>
    </div>
  );
}
