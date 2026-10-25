"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { deleteProduct } from "../../actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button type="button" variant="danger" className="w-full" onClick={() => setConfirming(true)}>
        <TrashIcon width={18} height={18} /> Excluir produto
      </Button>
    );
  }

  return (
    <div className="rounded-card border border-clay/30 bg-clay-soft p-4">
      <p className="mb-3 text-sm text-clay">Excluir de vez? Esta ação não pode ser desfeita.</p>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => setConfirming(false)} disabled={pending}>
          Cancelar
        </Button>
        <Button
          type="button"
          className="flex-1 bg-clay! hover:bg-clay/90!"
          disabled={pending}
          onClick={() => startTransition(() => deleteProduct(productId))}
        >
          {pending ? "Excluindo…" : "Sim, excluir"}
        </Button>
      </div>
    </div>
  );
}
