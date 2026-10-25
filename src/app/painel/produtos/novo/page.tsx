import type { Metadata } from "next";
import { getMyCategories, requireStore, requireUser } from "@/lib/dal";
import { BackLink } from "@/components/back-link";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const { user } = await requireUser();
  const store = await requireStore();
  const categories = await getMyCategories(store.id);

  return (
    <>
      <BackLink href="/painel">Produtos</BackLink>
      <h1 className="mt-2 mb-6 font-display text-3xl tracking-tight">Novo produto</h1>
      <ProductForm categories={categories} userId={user.id} />
    </>
  );
}
