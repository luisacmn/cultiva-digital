import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, FormMessage } from "@/components/ui";
import { ImageIcon, PlusIcon } from "@/components/icons";
import { getMyCategories, getMyProducts, requireStore } from "@/lib/dal";
import { formatPrice } from "@/lib/format";
import { imageUrl, storeUrl } from "@/lib/links";
import { AvailabilityToggle } from "./availability-toggle";
import { ShareCard } from "./share-card";

export const metadata: Metadata = { title: "Painel" };

const flashMessages: Record<string, string> = {
  "bem-vinda": "Sua vitrine foi criada! Agora é só publicar o primeiro produto.",
  publicado: "Produto publicado na vitrine.",
  salvo: "Alterações salvas.",
  removido: "Produto excluído.",
};

export default async function PainelPage({ searchParams }: PageProps<"/painel">) {
  const store = await requireStore();
  const [products, categories, params] = await Promise.all([
    getMyProducts(store.id),
    getMyCategories(store.id),
    searchParams,
  ]);
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const flash = Object.keys(flashMessages).find((key) => key in params);
  const availableCount = products.filter((p) => p.available).length;

  return (
    <div className="flex flex-col gap-6">
      {flash && <FormMessage state={{ message: flashMessages[flash] }} />}

      <ShareCard url={storeUrl(store.slug)} storeName={store.name} />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Produtos</h1>
          {products.length > 0 && (
            <p className="mt-1 text-sm text-muted">
              {products.length} {products.length === 1 ? "produto" : "produtos"} · {availableCount}{" "}
              {availableCount === 1 ? "disponível" : "disponíveis"}
            </p>
          )}
        </div>
        {products.length > 0 && (
          <ButtonLink href="/painel/produtos/novo" className="h-11 px-5">
            <PlusIcon width={18} height={18} /> Novo
          </ButtonLink>
        )}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-leaf text-moss">
            <ImageIcon width={26} height={26} />
          </span>
          <h2 className="mt-4 font-display text-xl">Sua vitrine está pronta para florescer</h2>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Publique seu primeiro produto com uma foto, o preço e uma descrição curta.
          </p>
          <ButtonLink href="/painel/produtos/novo" className="mt-6">
            <PlusIcon width={18} height={18} /> Publicar primeiro produto
          </ButtonLink>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {products.map((product) => {
            const src = imageUrl(product.image_path);
            return (
              <li key={product.id} className="flex items-center gap-3 p-3">
                <Link href={`/painel/produtos/${product.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" loading="lazy" className="size-16 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-leaf text-moss/60">
                      <ImageIcon />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{product.name}</span>
                    <span className="block text-sm text-muted">
                      {formatPrice(product.price)}
                      {product.category_id && categoryName.has(product.category_id) && (
                        <> · {categoryName.get(product.category_id)}</>
                      )}
                    </span>
                  </span>
                </Link>
                <AvailabilityToggle productId={product.id} available={product.available} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
