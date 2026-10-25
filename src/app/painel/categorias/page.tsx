import type { Metadata } from "next";
import { getMyCategories, getMyProducts, requireStore } from "@/lib/dal";
import { CategoryRow, NewCategoryForm } from "./category-forms";

export const metadata: Metadata = { title: "Categorias" };

const SUGGESTIONS = ["Terrários", "Suculentas", "Cactos", "Plantas de interior", "Kits para presente", "Vasos"];

export default async function CategoriesPage() {
  const store = await requireStore();
  const [categories, products] = await Promise.all([getMyCategories(store.id), getMyProducts(store.id)]);

  const counts = new Map<string, number>();
  for (const product of products) {
    if (product.category_id) counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);
  }
  const existing = new Set(categories.map((c) => c.name.toLowerCase()));
  const suggestions = SUGGESTIONS.filter((name) => !existing.has(name.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Categorias</h1>
        <p className="mt-1 text-sm text-muted">
          Organizam a vitrine: seus clientes filtram os produtos por elas.
        </p>
      </div>

      <NewCategoryForm suggestions={categories.length < 8 ? suggestions : []} />

      {categories.length > 0 && (
        <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface">
          {categories.map((category) => (
            <CategoryRow key={category.id} category={category} productCount={counts.get(category.id) ?? 0} />
          ))}
        </ul>
      )}
    </div>
  );
}
