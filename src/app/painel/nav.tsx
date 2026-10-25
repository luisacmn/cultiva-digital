"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/painel", label: "Produtos" },
  { href: "/painel/categorias", label: "Categorias" },
  { href: "/painel/vitrine", label: "Minha vitrine" },
] as const;

export function PainelNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-2">
      {items.map((item) => {
        const active =
          item.href === "/painel"
            ? pathname === "/painel" || pathname.startsWith("/painel/produtos")
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
              active ? "bg-moss text-white" : "text-muted hover:bg-leaf hover:text-moss-dark"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
