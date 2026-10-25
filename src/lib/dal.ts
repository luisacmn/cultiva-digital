import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Category, Product, Store } from "./types";

/** Usuária logada (validada no servidor do Supabase). Redireciona para o login se não houver. */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/entrar");
  return { supabase, user: data.user };
});

export const getMyStore = cache(async (): Promise<Store | null> => {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle();
  return data;
});

/** Para páginas do painel que só fazem sentido depois de criar a vitrine. */
export async function requireStore(): Promise<Store> {
  const store = await getMyStore();
  if (!store) redirect("/painel/vitrine");
  return store;
}

export async function getMyCategories(storeId: string): Promise<Category[]> {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("categories").select("*").eq("store_id", storeId).order("name");
  return data ?? [];
}

export async function getMyProducts(storeId: string): Promise<Product[]> {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
