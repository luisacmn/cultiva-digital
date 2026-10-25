import Link from "next/link";
import { Logo } from "@/components/logo";
import { ExternalIcon } from "@/components/icons";
import { getMyStore } from "@/lib/dal";
import { signOut } from "../(auth)/actions";
import { PainelNav } from "./nav";

export default async function PainelLayout({ children }: LayoutProps<"/painel">) {
  const store = await getMyStore();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <Logo href="/painel" />
          <div className="flex items-center gap-1">
            {store && (
              <Link
                href={`/${store.slug}`}
                target="_blank"
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-moss hover:bg-leaf"
              >
                Ver vitrine <ExternalIcon width={16} height={16} />
              </Link>
            )}
            <form action={signOut}>
              <button className="h-10 rounded-full px-3 text-sm text-muted hover:bg-leaf">Sair</button>
            </form>
          </div>
        </div>
        {store && <PainelNav />}
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6 pb-16">{children}</main>
    </div>
  );
}
