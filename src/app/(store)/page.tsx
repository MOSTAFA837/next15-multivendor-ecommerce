import CategoriesHeader from "@/components/store/layout/categories-header";
import ProductList from "@/components/store/shared/product-list";
import { getProducts } from "@/queries/product";

export default async function Home() {
  const { products } = await getProducts();

  return (
    <div className="p-14">
      <CategoriesHeader />

      <ProductList products={products} title="All Products" arrow />
    </div>
  );
}
