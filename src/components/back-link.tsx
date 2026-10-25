import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="-ml-2 inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-sm text-muted hover:text-moss">
      <ArrowLeftIcon width={18} height={18} />
      {children}
    </Link>
  );
}
