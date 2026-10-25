import type { Store } from "@/lib/types";
import { CartProvider } from "./cart";
import { CartBar } from "./cart-ui";
import { StoreFooter } from "./store-footer";

export function StorefrontShell({ store, children }: { store: Store; children: React.ReactNode }) {
  return (
    <CartProvider store={store}>
      <div className="flex flex-1 flex-col pb-20">
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-4">{children}</main>
        <StoreFooter store={store} />
      </div>
      <CartBar />
    </CartProvider>
  );
}
