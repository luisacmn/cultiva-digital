"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

export function SubmitButton({
  children,
  pendingText,
  pending: pendingProp,
  className = "w-full",
}: {
  children: React.ReactNode;
  pendingText: string;
  /** Para formulários com onSubmit (useFormAction), onde useFormStatus não enxerga o envio. */
  pending?: boolean;
  className?: string;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </Button>
  );
}
