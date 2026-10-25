"use client";

import { useRef } from "react";
import { Button } from "@/components/ui";
import { PlusIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { cartMessage, contactUrl } from "@/lib/links";
import type { Product } from "@/lib/types";
import { cartTotals, useCart } from "./cart";
import { OrderButton } from "./order-button";

/** Botão redondo "+" sobre a foto do card. */
export function QuickAddButton({ product }: { product: Product }) {
  const { items, add } = useCart();
  const quantity = items.find((item) => item.id === product.id)?.quantity ?? 0;

  return (
    <button
      type="button"
      onClick={() => add(product)}
      aria-label={`Adicionar ${product.name} ao pedido`}
      className="absolute right-2 bottom-2 flex h-10 min-w-10 items-center justify-center gap-1 rounded-full bg-surface/95 px-2.5 text-sm font-medium text-moss-dark shadow-md transition-transform active:scale-95"
    >
      <PlusIcon width={18} height={18} />
      {quantity > 0 && <span>{quantity}</span>}
    </button>
  );
}

/** Botão principal da página do produto. */
export function AddToCartButton({ product }: { product: Product }) {
  const { items, add } = useCart();
  const quantity = items.find((item) => item.id === product.id)?.quantity ?? 0;

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={() => add(product)} className="w-full">
        <PlusIcon width={18} height={18} />
        {quantity > 0 ? "Adicionar mais um" : "Adicionar ao pedido"}
      </Button>
      {quantity > 0 && (
        <p role="status" className="text-center text-sm text-muted">
          {quantity} {quantity === 1 ? "unidade" : "unidades"} no seu pedido
        </p>
      )}
    </div>
  );
}

/** Barra fixa no rodapé + tela do pedido. */
export function CartBar() {
  const { store, items, setQuantity, clear } = useCart();
  const dialog = useRef<HTMLDialogElement>(null);
  const { count, total, hasUnpriced } = cartTotals(items);

  if (count === 0) return null;

  const message = cartMessage(store, items);
  const channelLabel = store.contact_channel === "instagram" ? "pelo Direct" : "pelo WhatsApp";

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          className="mx-auto flex h-14 w-full max-w-md items-center justify-between rounded-full bg-moss px-6 text-white shadow-lg transition-colors hover:bg-moss-dark"
        >
          <span className="font-medium">Ver pedido</span>
          <span className="text-sm text-white/85">
            {count} {count === 1 ? "item" : "itens"} · {formatPrice(total)}
            {hasUnpriced && "+"}
          </span>
        </button>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="cart-title"
        onClick={(event) => event.target === dialog.current && dialog.current.close()}
        className="m-auto mb-0 w-full max-w-lg rounded-t-[1.75rem] bg-paper p-0 text-ink backdrop:bg-ink/40 sm:mb-auto sm:rounded-[1.75rem]"
      >
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 id="cart-title" className="font-display text-2xl">
              Seu pedido
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="h-10 rounded-full px-3 text-sm text-muted hover:bg-leaf"
            >
              Fechar
            </button>
          </div>

          <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate">{item.name}</p>
                  <p className="text-sm text-muted">
                    {item.price === null ? "Sob consulta" : formatPrice(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center rounded-full border border-line bg-surface">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.id, item.quantity - 1)}
                    aria-label={item.quantity === 1 ? `Remover ${item.name}` : `Diminuir ${item.name}`}
                    className="grid size-10 place-items-center text-lg text-muted"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.id, item.quantity + 1)}
                    aria-label={`Aumentar ${item.name}`}
                    className="grid size-10 place-items-center text-lg text-muted"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-line px-5 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]">
            <div className="flex items-baseline justify-between">
              <span className="text-muted">Total</span>
              <span className="font-display text-2xl">{formatPrice(total)}</span>
            </div>
            {hasUnpriced && <p className="-mt-2 text-sm text-muted">+ itens com preço sob consulta</p>}
            <OrderButton
              href={contactUrl(store, message)}
              channel={store.contact_channel}
              message={message}
              label={`Enviar pedido ${channelLabel}`}
              className="w-full"
            />
            <p className="text-center text-xs text-muted">
              A conversa abre com a lista pronta. Pagamento e entrega são combinados direto com a vendedora.
            </p>
            <button type="button" onClick={clear} className="h-10 text-sm text-muted underline-offset-4 hover:underline">
              Esvaziar pedido
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
