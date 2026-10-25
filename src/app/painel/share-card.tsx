"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/icons";

export function ShareCard({ url, storeName }: { url: string; storeName: string }) {
  const [copied, setCopied] = useState(false);
  const displayUrl = url.replace(/^https?:\/\//, "");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: storeName, url });
      } catch {
        // compartilhamento cancelado
      }
    } else {
      await copy();
    }
  }

  return (
    <div className="rounded-card bg-moss p-5 text-white">
      <p className="text-sm text-white/75">Link da sua vitrine</p>
      <p className="mt-1 truncate font-display text-xl">{displayUrl}</p>
      <p className="mt-2 text-sm text-white/75">Coloque na bio do Instagram e envie para seus clientes.</p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={copy}
          className="h-11 flex-1 rounded-full bg-white text-[15px] font-medium text-moss-dark transition-colors hover:bg-leaf"
        >
          {copied ? "Link copiado!" : "Copiar link"}
        </button>
        <button
          onClick={share}
          aria-label="Compartilhar"
          className="grid size-11 place-items-center rounded-full border border-white/30 transition-colors hover:bg-white/10"
        >
          <ShareIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
