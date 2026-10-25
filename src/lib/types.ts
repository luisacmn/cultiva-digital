export type ContactChannel = "whatsapp" | "instagram";

export type Store = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  description: string | null;
  whatsapp: string | null;
  instagram: string | null;
  contact_channel: ContactChannel;
  logo_path: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  store_id: string;
  name: string;
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number | null;
  available: boolean;
  image_path: string | null;
  created_at: string;
  updated_at: string;
};

/** Item do pedido montado pelo visitante (guardado só no navegador dele). */
export type CartItem = { id: string; name: string; price: number | null; quantity: number };

/** Estado devolvido pelas Server Actions usadas com useActionState. */
export type FormState = { error?: string; message?: string } | undefined;
