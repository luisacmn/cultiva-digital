"use client";

import { useState } from "react";
import { InstagramIcon, WhatsappIcon } from "@/components/icons";
import { buttonClass } from "@/components/ui";
import type { ContactChannel } from "@/lib/types";

export function OrderButton({
  href,
  channel,
  message,
  label,
  variant = "primary",
  className = "",
}: {
  href: string;
  channel: ContactChannel;
  message: string;
  label: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = channel === "instagram" ? InstagramIcon : WhatsappIcon;

  function handleClick() {
    // O Direct do Instagram não aceita mensagem pronta; copiamos para a pessoa só colar.
    if (channel !== "instagram") return;
    navigator.clipboard
      ?.writeText(message)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 6000);
      })
      .catch(() => {});
  }

  return (
    <div className="flex flex-col gap-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={buttonClass(variant, className)}
      >
        <Icon width={20} height={20} />
        {label}
      </a>
      {copied && (
        <p role="status" className="text-center text-sm text-muted">
          Mensagem copiada! É só colar na conversa do Direct.
        </p>
      )}
    </div>
  );
}
