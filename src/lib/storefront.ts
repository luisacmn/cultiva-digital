import "server-only";
import { cache } from "react";
import { createPublicClient } from "./supabase/public";
import type { Category, Product, Store } from "./types";

export const getStoreBySlug = cache(async (slug: string): Promise<Store | null> => {
  const { data } = await createPublicClient().from("stores").select("*").eq("slug", slug).maybeSingle();
  return data;
});

/** Vitrine exibida na página inicial: a de HOME_STORE_SLUG ou, sem ela, a primeira criada. */
export async function getHomeStore(): Promise<Store | null> {
  const slug = process.env.HOME_STORE_SLUG;
  if (slug) return getStoreBySlug(slug);
  const { data } = await createPublicClient()
    .from("stores")
    .select("*")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  return data;
}

/**
 * Por enquanto a plataforma atende uma única vendedora: o cadastro só fica aberto
 * até a primeira vitrine ser criada. Para receber outras vendedoras, use ALLOW_SIGNUPS=true.
 */
export async function isSignupOpen() {
  if (process.env.ALLOW_SIGNUPS === "true") return true;
  const { count } = await createPublicClient().from("stores").select("id", { count: "exact", head: true });
  return count === 0;
}

export const getStorefront = cache(async (store: Store) => {
  const supabase = createPublicClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").eq("store_id", store.id).order("name"),
    supabase
      .from("products")
      .select("*")
      .eq("store_id", store.id)
      .order("available", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  return { categories: (categories ?? []) as Category[], products: (products ?? []) as Product[] };
});

export const getStoreProduct = cache(async (storeId: string, productId: string): Promise<Product | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(productId)) return null;
  const { data } = await createPublicClient()
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .eq("id", productId)
    .maybeSingle();
  return data;
});
