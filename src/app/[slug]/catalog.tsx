"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ImageIcon, SearchIcon } from "@/components/icons";
import { formatPrice, normalizeSearch } from "@/lib/format";
import { imageUrl } from "@/lib/links";
import type { Category, Product } from "@/lib/types";
import { QuickAddButton } from "./cart-ui";

export function Catalog({
  slug,
  categories,
  products,
}: {
  slug: string;
  categories: Category[];
  products: Product[];
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Só mostra categorias que têm produtos.
  const usedCategories = useMemo(
    () => categories.filter((c) => products.some((p) => p.category_id === c.id)),
    [categories, products],
  );

  const visible = useMemo(() => {
    const q = normalizeSearch(query);
    return products.filter(
      (p) =>
        (!categoryId || p.category_id === categoryId) &&
        (!q || normalizeSearch(`${p.name} ${p.description ?? ""}`).includes(q)),
    );
  }, [products, query, categoryId]);

  if (products.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line px-6 py-12 text-center text-muted">
        Em breve, novidades por aqui. 🌱
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-0 z-10 -mx-5 flex flex-col gap-3 bg-paper/95 px-5 py-3 backdrop-blur">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <label htmlFor="search" className="sr-only">
            Buscar
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar plantas, terrários…"
            className="h-12 w-full rounded-full border border-line bg-surface pr-4 pl-12 text-base outline-none transition placeholder:text-muted/70 focus:border-moss focus:ring-4 focus:ring-leaf"
          />
        </div>
        {usedCategories.length > 0 && (
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
            <Chip active={!categoryId} onClick={() => setCategoryId(null)}>
              Tudo
            </Chip>
            {usedCategories.map((category) => (
              <Chip
                key={category.id}
                active={categoryId === category.id}
                onClick={() => setCategoryId(categoryId === category.id ? null : category.id)}
              >
                {category.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-muted">Nenhum produto encontrado.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
          {visible.map((product) => (
            <li key={product.id} className="group">
              <ProductCard slug={slug} product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-full px-4 text-sm transition-colors ${
        active ? "bg-moss text-white" : "border border-line bg-surface text-ink hover:border-moss/40"
      }`}
    >
      {children}
    </button>
  );
}

function ProductCard({ slug, product }: { slug: string; product: Product }) {
  const src = imageUrl(product.image_path);
  const href = `/${slug}/${product.id}`;
  return (
    <>
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-card bg-leaf">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              loading="lazy"
              className={`aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                product.available ? "" : "opacity-60 grayscale-[40%]"
              }`}
            />
          ) : (
            <div className="grid aspect-square place-items-center text-moss/40">
              <ImageIcon width={32} height={32} />
            </div>
          )}
          {!product.available && (
            <span className="absolute top-2 left-2 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-medium text-clay">
              Esgotado
            </span>
          )}
        </Link>
        {product.available && <QuickAddButton product={product} />}
      </div>
      <Link href={href} className="mt-2.5 block">
        <span className="line-clamp-2 text-[15px] leading-snug">{product.name}</span>
        <span className="mt-0.5 block text-sm font-medium text-moss-dark">{formatPrice(product.price)}</span>
      </Link>
    </>
  );
}
