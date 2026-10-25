import { InstagramIcon } from "@/components/icons";
import { contactUrl, imageUrl, orderMessage } from "@/lib/links";
import type { Store } from "@/lib/types";
import { OrderButton } from "./order-button";

export function StoreHeader({ store }: { store: Store }) {
  const message = orderMessage(store);
  const logo = imageUrl(store.logo_path);

  return (
    <header className="flex flex-col items-center pt-10 pb-6 text-center">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={`Logo ${store.name}`} className="h-32 w-auto max-w-64 rounded-2xl object-contain" />
      ) : (
        <span className="grid size-16 place-items-center rounded-full bg-leaf font-display text-2xl text-moss-dark">
          {store.name.trim().charAt(0).toUpperCase()}
        </span>
      )}
      {/* Com logo, o nome já aparece nela: o título fica só para leitores de tela e buscadores. */}
      <h1 className={logo ? "sr-only" : "mt-4 font-display text-4xl tracking-tight text-balance"}>{store.name}</h1>
      {store.description && (
        <p className="mt-3 max-w-md whitespace-pre-line text-pretty text-muted">{store.description}</p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <OrderButton
          href={contactUrl(store, message)}
          channel={store.contact_channel}
          message={message}
          label="Fale comigo"
          variant="secondary"
          className="h-11 px-5"
        />
        {store.instagram && store.contact_channel !== "instagram" && (
          <a
            href={`https://instagram.com/${store.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram @${store.instagram}`}
            className="grid size-11 place-items-center rounded-full border border-line bg-surface text-ink hover:border-moss/40"
          >
            <InstagramIcon />
          </a>
        )}
      </div>
    </header>
  );
}
