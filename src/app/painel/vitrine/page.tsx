import type { Metadata } from "next";
import { getMyStore } from "@/lib/dal";
import { siteUrl } from "@/lib/links";
import { StoreForm } from "./store-form";

export const metadata: Metadata = { title: "Minha vitrine" };

export default async function StoreSettingsPage() {
  const store = await getMyStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">{store ? "Minha vitrine" : "Vamos criar sua vitrine"}</h1>
        <p className="mt-1 text-sm text-muted">
          {store
            ? "Essas informações aparecem no topo da sua página."
            : "Só o básico: o nome do seu negócio e por onde os clientes falam com você."}
        </p>
      </div>
      <StoreForm store={store} baseUrl={siteUrl().replace(/^https?:\/\//, "")} />
    </div>
  );
}
