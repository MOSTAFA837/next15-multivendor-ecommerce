import SubCategoryDetails from "@/components/dashboard/forms/sub-category-details";
import { getAllCategories } from "@/queries/category";

export default async function AdminNewSubCategoryPage() {
  const categories = await getAllCategories();
  return <SubCategoryDetails categories={categories} />;
}
