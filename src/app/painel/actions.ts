"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMyStore, requireStore, requireUser } from "@/lib/dal";
import { normalizeInstagram, normalizeWhatsapp, parsePrice, slugify } from "@/lib/format";
import { BUCKET, RESERVED_SLUGS } from "@/lib/links";
import type { FormState } from "@/lib/types";

const UNIQUE_VIOLATION = "23505";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateStore(slug: string) {
  revalidatePath("/painel", "layout");
  revalidatePath(`/${slug}`, "layout");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Vitrine
// ---------------------------------------------------------------------------

export async function saveStore(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const current = await getMyStore();

  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  const description = text(formData, "description") || null;
  const whatsappRaw = text(formData, "whatsapp");
  const instagramRaw = text(formData, "instagram");
  const contactChannel = formData.get("contact_channel") === "instagram" ? "instagram" : "whatsapp";

  if (!name) return { error: "Dê um nome para a sua vitrine." };
  if (slug.length < 3) return { error: "O endereço da vitrine precisa ter pelo menos 3 letras ou números." };
  if (RESERVED_SLUGS.has(slug)) return { error: "Este endereço não está disponível. Tente outro." };

  const whatsapp = whatsappRaw ? normalizeWhatsapp(whatsappRaw) : null;
  if (whatsappRaw && !whatsapp) return { error: "Confira o WhatsApp: use o DDD e o número, ex.: (81) 99999-1234." };

  const instagram = instagramRaw ? normalizeInstagram(instagramRaw) : null;
  if (instagramRaw && !instagram) return { error: "Confira o usuário do Instagram, ex.: @meuterrario." };

  if (contactChannel === "whatsapp" && !whatsapp)
    return { error: "Informe o WhatsApp, já que é por ele que você quer receber os pedidos." };
  if (contactChannel === "instagram" && !instagram)
    return { error: "Informe o Instagram, já que é por ele que você quer receber os pedidos." };

  const logoPath = text(formData, "logo_path") || null;
  if (logoPath && !logoPath.startsWith(`${user.id}/`)) return { error: "Logo inválida." };

  const values = { name, slug, description, whatsapp, instagram, contact_channel: contactChannel, logo_path: logoPath };

  const { error } = current
    ? await supabase.from("stores").update(values).eq("id", current.id)
    : await supabase.from("stores").insert({ ...values, owner_id: user.id });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) return { error: "Este endereço já está em uso. Tente outro." };
    console.error("saveStore:", error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  if (current?.logo_path && current.logo_path !== logoPath) {
    await supabase.storage.from(BUCKET).remove([current.logo_path]);
  }

  if (current && current.slug !== slug) revalidatePath(`/${current.slug}`, "layout");
  revalidateStore(slug);

  if (!current) redirect("/painel?bem-vinda=1");
  return { message: "Vitrine atualizada." };
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export async function createCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const store = await requireStore();
  const name = text(formData, "name");
  if (!name) return { error: "Escreva o nome da categoria." };

  const { error } = await supabase.from("categories").insert({ store_id: store.id, name });
  if (error) {
    if (error.code === UNIQUE_VIOLATION) return { error: `Você já tem a categoria “${name}”.` };
    return { error: "Não foi possível criar a categoria." };
  }

  revalidateStore(store.slug);
  return { message: `Categoria “${name}” criada.` };
}

export async function renameCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const store = await requireStore();
  const id = text(formData, "id");
  const name = text(formData, "name");
  if (!name) return { error: "O nome não pode ficar vazio." };

  const { error } = await supabase.from("categories").update({ name }).eq("id", id).eq("store_id", store.id);
  if (error) {
    if (error.code === UNIQUE_VIOLATION) return { error: `Você já tem a categoria “${name}”.` };
    return { error: "Não foi possível renomear." };
  }

  revalidateStore(store.slug);
  return { message: "Salvo." };
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireUser();
  const store = await requireStore();
  await supabase.from("categories").delete().eq("id", text(formData, "id")).eq("store_id", store.id);
  revalidateStore(store.slug);
}

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------

export type ProductInput = {
  id?: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  available: boolean;
  /** Caminho da foto no Storage (já enviada pelo navegador), ou null para nenhuma. */
  imagePath: string | null;
};

export async function saveProduct(input: ProductInput): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const store = await requireStore();

  const name = input.name.trim();
  if (!name) return { error: "Dê um nome ao produto." };

  const price = parsePrice(input.price);
  if (Number.isNaN(price)) return { error: "Confira o preço, ex.: 45,90. Deixe vazio para “sob consulta”." };

  if (input.imagePath && !input.imagePath.startsWith(`${user.id}/`)) return { error: "Foto inválida." };

  const values = {
    name,
    description: input.description.trim() || null,
    price,
    category_id: input.categoryId || null,
    available: input.available,
    image_path: input.imagePath,
  };

  if (input.id) {
    const { data: previous } = await supabase
      .from("products")
      .select("image_path")
      .eq("id", input.id)
      .eq("store_id", store.id)
      .single();

    const { error } = await supabase.from("products").update(values).eq("id", input.id).eq("store_id", store.id);
    if (error) {
      console.error("saveProduct:", error);
      return { error: "Não foi possível salvar o produto. Tente novamente." };
    }

    if (previous?.image_path && previous.image_path !== input.imagePath) {
      await supabase.storage.from(BUCKET).remove([previous.image_path]);
    }
  } else {
    const { error } = await supabase.from("products").insert({ ...values, store_id: store.id });
    if (error) {
      console.error("saveProduct:", error);
      return { error: "Não foi possível publicar o produto. Tente novamente." };
    }
  }

  revalidateStore(store.slug);
  redirect(input.id ? "/painel?salvo=1" : "/painel?publicado=1");
}

export async function setAvailability(productId: string, available: boolean) {
  const { supabase } = await requireUser();
  const store = await requireStore();
  await supabase.from("products").update({ available }).eq("id", productId).eq("store_id", store.id);
  revalidateStore(store.slug);
}

export async function deleteProduct(productId: string) {
  const { supabase } = await requireUser();
  const store = await requireStore();

  const { data } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("store_id", store.id)
    .select("image_path")
    .maybeSingle();

  if (data?.image_path) await supabase.storage.from(BUCKET).remove([data.image_path]);

  revalidateStore(store.slug);
  redirect("/painel?removido=1");
}
