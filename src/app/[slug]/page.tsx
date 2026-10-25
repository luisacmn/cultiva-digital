import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { imageUrl } from "@/lib/links";
import { getStoreBySlug, getStorefront } from "@/lib/storefront";
import { Catalog } from "./catalog";
import { StoreHeader } from "./store-header";

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const store = await getStoreBySlug((await params).slug);
  if (!store) return {};
  const { products } = await getStorefront(store);
  const cover = imageUrl(products.find((p) => p.image_path)?.image_path ?? store.logo_path);
  const description = store.description ?? `Conheça os produtos de ${store.name}.`;

  return {
    title: { absolute: store.name },
    description,
    openGraph: { title: store.name, description, images: cover ? [cover] : undefined },
  };
}

export default async function StorefrontPage({ params }: PageProps<"/[slug]">) {
  const store = await getStoreBySlug((await params).slug);
  if (!store) notFound();
  const { categories, products } = await getStorefront(store);

  return (
    <>
      <StoreHeader store={store} />
      <Catalog slug={store.slug} categories={categories} products={products} />
    </>
  );
}
