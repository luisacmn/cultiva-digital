import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/storefront";
import { StorefrontShell } from "./storefront-shell";

export default async function StorefrontLayout({ children, params }: LayoutProps<"/[slug]">) {
  const store = await getStoreBySlug((await params).slug);
  if (!store) notFound();
  return <StorefrontShell store={store}>{children}</StorefrontShell>;
}
