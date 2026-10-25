import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMyCategories, requireStore, requireUser } from "@/lib/dal";
import type { Product } from "@/lib/types";
import { BackLink } from "@/components/back-link";
import { ProductForm } from "../product-form";
import { DeleteProductButton } from "./delete-button";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: PageProps<"/painel/produtos/[id]">) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const store = await requireStore();

  const [{ data: product }, categories] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).eq("store_id", store.id).maybeSingle<Product>(),
    getMyCategories(store.id),
  ]);
  if (!product) notFound();

  return (
    <>
      <BackLink href="/painel">Produtos</BackLink>
      <h1 className="mt-2 mb-6 font-display text-3xl tracking-tight">Editar produto</h1>
      <ProductForm product={product} categories={categories} userId={user.id} />
      <div className="mt-6">
        <DeleteProductButton productId={product.id} />
      </div>
    </>
  );
}
