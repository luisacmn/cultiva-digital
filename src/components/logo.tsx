import Link from "next/link";
import { SproutIcon } from "./icons";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-moss-dark">
      <span className="grid size-8 place-items-center rounded-full bg-leaf">
        <SproutIcon width={18} height={18} />
      </span>
      <span className="font-display text-lg tracking-tight">Cultiva Digital</span>
    </Link>
  );
}
