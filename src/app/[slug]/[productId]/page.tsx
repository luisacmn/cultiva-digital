import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { contactUrl, imageUrl, orderMessage } from "@/lib/links";
import { getStoreBySlug, getStoreProduct, getStorefront } from "@/lib/storefront";
import { BackLink } from "@/components/back-link";
import { AddToCartButton } from "../cart-ui";
import { OrderButton } from "../order-button";

async function load(params: PageProps<"/[slug]/[productId]">["params"]) {
  const { slug, productId } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return null;
  const product = await getStoreProduct(store.id, productId);
  if (!product) return null;
  return { store, product };
}

export async function generateMetadata({ params }: PageProps<"/[slug]/[productId]">): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const { store, product } = data;
  const cover = imageUrl(product.image_path);
  return {
    title: { absolute: `${product.name} · ${store.name}` },
    description: product.description ?? `${formatPrice(product.price)} — ${store.name}`,
    openGraph: { title: product.name, images: cover ? [cover] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/[slug]/[productId]">) {
  const data = await load(params);
  if (!data) notFound();
  const { store, product } = data;
  const { categories } = await getStorefront(store);
  const category = categories.find((c) => c.id === product.category_id);
  const src = imageUrl(product.image_path);
  const message = orderMessage(store, product);

  return (
    <article className="pt-4">
      <BackLink href={`/${store.slug}`}>{store.name}</BackLink>

      <div className="mt-3 grid gap-6 sm:grid-cols-2 sm:gap-8">
        <div className="overflow-hidden rounded-card bg-leaf">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={product.name} className="aspect-[4/5] w-full object-cover" />
          ) : (
            <div className="grid aspect-[4/5] place-items-center text-moss/40">
              <ImageIcon width={40} height={40} />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {category && <p className="text-sm text-muted">{category.name}</p>}
          <h1 className="mt-1 font-display text-3xl tracking-tight text-balance">{product.name}</h1>
          <p className="mt-2 text-xl text-moss-dark">{formatPrice(product.price)}</p>
          {!product.available && (
            <p className="mt-3 inline-flex self-start rounded-full bg-clay-soft px-3 py-1 text-sm text-clay">
              Esgotado no momento
            </p>
          )}
          {product.description && (
            <p className="mt-5 whitespace-pre-line text-pretty leading-relaxed text-ink/85">{product.description}</p>
          )}

          <div className="mt-8">
            {product.available ? (
              <AddToCartButton product={product} />
            ) : (
              <OrderButton
                href={contactUrl(store, message)}
                channel={store.contact_channel}
                message={message}
                label="Perguntar quando volta"
                variant="secondary"
                className="w-full"
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
