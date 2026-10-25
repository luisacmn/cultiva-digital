import Link from "next/link";
import { InstagramIcon, SproutIcon, WhatsappIcon } from "@/components/icons";
import { formatWhatsapp } from "@/lib/format";
import { imageUrl } from "@/lib/links";
import type { Store } from "@/lib/types";

export function StoreFooter({ store }: { store: Store }) {
  const logo = imageUrl(store.logo_path);
  const channel = store.contact_channel === "instagram" ? "pelo Direct do Instagram" : "pelo WhatsApp";
  const steps = ["Escolha os produtos e adicione ao pedido.", `Envie o pedido ${channel}.`, "Combine o pagamento e a entrega na conversa."];

  return (
    <footer className="mt-8 border-t border-line">
      <div className="mx-auto grid w-full max-w-3xl gap-8 px-5 py-10 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="size-11 rounded-xl object-contain" />
            ) : (
              <span className="grid size-11 place-items-center rounded-xl bg-leaf font-display text-lg text-moss-dark">
                {store.name.trim().charAt(0).toUpperCase()}
              </span>
            )}
            <span className="font-display text-xl">{store.name}</span>
          </div>
          <ul className="flex flex-col gap-2 text-sm">
            {store.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${store.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-ink hover:text-moss"
                >
                  <WhatsappIcon width={18} height={18} className="text-moss" />
                  {formatWhatsapp(store.whatsapp)}
                </a>
              </li>
            )}
            {store.instagram && (
              <li>
                <a
                  href={`https://instagram.com/${store.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-ink hover:text-moss"
                >
                  <InstagramIcon width={18} height={18} className="text-moss" />@{store.instagram}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-medium tracking-[0.12em] text-muted uppercase">Como comprar</h2>
          <ol className="flex flex-col gap-2.5 text-sm">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-leaf text-xs font-medium text-moss-dark">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-5 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>
              © {new Date().getFullYear()} {store.name}
            </span>
            <Link href="/privacidade" className="underline-offset-4 hover:text-moss hover:underline">
              Aviso de privacidade
            </Link>
            <Link href="/entrar" className="underline-offset-4 hover:text-moss hover:underline">
              Área da vendedora
            </Link>
          </div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-moss">
            <SproutIcon width={14} height={14} /> Feito com Cultiva Digital
          </Link>
        </div>
      </div>
    </footer>
  );
}
