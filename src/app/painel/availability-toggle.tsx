"use client";

import { useOptimistic, useTransition } from "react";
import { setAvailability } from "./actions";

export function AvailabilityToggle({ productId, available }: { productId: string; available: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(available);
  const [, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setOptimistic(!optimistic);
      await setAvailability(productId, !optimistic);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimistic}
      className={`h-8 shrink-0 rounded-full px-3 text-xs font-medium transition-colors ${
        optimistic ? "bg-leaf text-moss-dark" : "bg-clay-soft text-clay"
      }`}
    >
      {optimistic ? "Disponível" : "Esgotado"}
    </button>
  );
}
