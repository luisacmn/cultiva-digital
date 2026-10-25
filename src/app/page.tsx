import { connection } from "next/server";
import { getHomeStore, getStorefront } from "@/lib/storefront";
import { Catalog } from "./[slug]/catalog";
import { StoreHeader } from "./[slug]/store-header";
import { StorefrontShell } from "./[slug]/storefront-shell";
import { Landing } from "./landing";

export default async function Home() {
  // Sempre busca no banco, para mostrar os produtos atualizados.
  await connection();
  const store = await getHomeStore();
  // Enquanto nenhuma vitrine existir, mostra a apresentação para criar a conta.
  if (!store) return <Landing />;

  const { categories, products } = await getStorefront(store);

  return (
    <StorefrontShell store={store}>
      <title>{store.name}</title>
      <StoreHeader store={store} />
      <Catalog slug={store.slug} categories={categories} products={products} />
    </StorefrontShell>
  );
}
