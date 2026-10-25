import type { CartItem, Product, Store } from "./types";
import { formatPrice } from "./format";

export const BUCKET = "product-images";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function storeUrl(slug: string) {
  return `${siteUrl()}/${slug}`;
}

export function imageUrl(path: string | null) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export function orderMessage(store: Store, product?: Product) {
  if (!product) return `Olá! Vi sua vitrine ${store.name} e gostaria de fazer um pedido.`;
  const link = `${storeUrl(store.slug)}/${product.id}`;
  return product.available
    ? `Olá! Vi na sua vitrine e tenho interesse em: ${product.name} (${formatPrice(product.price)}).\n${link}`
    : `Olá! Vi na sua vitrine o produto ${product.name}. Quando ele volta a ficar disponível?\n${link}`;
}

export function cartMessage(store: Store, items: CartItem[]) {
  const lines = items.map((item) =>
    item.price === null
      ? `• ${item.quantity}x ${item.name} (sob consulta)`
      : `• ${item.quantity}x ${item.name} — ${formatPrice(item.price * item.quantity)}`,
  );
  const total = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  const hasUnpriced = items.some((item) => item.price === null);
  const totalLine = hasUnpriced ? `Total: ${formatPrice(total)} + itens sob consulta` : `Total: ${formatPrice(total)}`;

  return [`Olá! Vi sua vitrine ${store.name} e gostaria de fazer este pedido:`, "", ...lines, "", totalLine].join("\n");
}

export function contactUrl(store: Store, message: string) {
  if (store.contact_channel === "instagram" && store.instagram) {
    return `https://ig.me/m/${store.instagram}`;
  }
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Rotas do app que não podem virar endereço de vitrine. */
export const RESERVED_SLUGS = new Set([
  "painel", "entrar", "cadastro", "sair", "auth", "api", "privacidade",
  "recuperar-senha", "nova-senha", "vitrine", "admin", "sobre", "ajuda",
]);
