"use client";

import { useRef, useState } from "react";
import { Field, FormMessage, Input, Textarea } from "@/components/ui";
import { InstagramIcon, WhatsappIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { useFormAction } from "@/lib/use-form-action";
import { formatWhatsapp, slugify } from "@/lib/format";
import { compressImage } from "@/lib/image";
import { BUCKET, imageUrl } from "@/lib/links";
import { createClient } from "@/lib/supabase/client";
import type { ContactChannel, Store } from "@/lib/types";
import { saveStore } from "../actions";

export function StoreForm({ store, baseUrl }: { store: Store | null; baseUrl: string }) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(imageUrl(store?.logo_path ?? null));
  const logoInput = useRef<HTMLInputElement>(null);

  // A logo nova é enviada direto do navegador para o Storage; a action só recebe o caminho.
  const { state, onSubmit, pending } = useFormAction(saveStore, undefined, async (formData) => {
    if (!logoFile) return;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const blob = await compressImage(logoFile, 600);
      const path = `${data.user!.id}/logo-${crypto.randomUUID()}.${blob.type === "image/webp" ? "webp" : "jpg"}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (error) throw error;
      formData.set("logo_path", path);
      setLogoFile(null);
    } catch {
      return "Não conseguimos enviar a logo. Verifique a internet e tente de novo.";
    }
  });
  const [name, setName] = useState(store?.name ?? "");
  const [slug, setSlug] = useState(store?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(store));
  const [channel, setChannel] = useState<ContactChannel>(store?.contact_channel ?? "whatsapp");

  const shownSlug = slugEdited ? slug : slugify(name);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <input
          ref={logoInput}
          id="logo"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file?.type.startsWith("image/")) return;
            if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
          }}
        />
        {/* Caminho da logo já salva; some ao remover, e é trocado pelo novo ao enviar outra. */}
        {!logoFile && logoPreview && store?.logo_path && <input type="hidden" name="logo_path" value={store.logo_path} />}
        <label
          htmlFor="logo"
          className="grid size-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-line bg-leaf font-display text-3xl text-moss-dark"
        >
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoPreview} alt="Logo da vitrine" className="size-full bg-surface object-contain" />
          ) : (
            (name.trim().charAt(0) || "?").toUpperCase()
          )}
        </label>
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium">Logo (opcional)</span>
          <div className="flex gap-1">
            <label htmlFor="logo" className="cursor-pointer rounded-full px-3 py-1.5 text-sm text-moss hover:bg-leaf">
              {logoPreview ? "Trocar" : "Adicionar logo"}
            </label>
            {logoPreview && (
              <button
                type="button"
                onClick={() => {
                  setLogoFile(null);
                  setLogoPreview(null);
                  if (logoInput.current) logoInput.current.value = "";
                }}
                className="rounded-full px-3 py-1.5 text-sm text-clay hover:bg-clay-soft"
              >
                Remover
              </button>
            )}
          </div>
          <span className="text-xs text-muted">Com logo, o nome não aparece escrito no topo da vitrine.</span>
        </div>
      </div>

      <Field label="Nome da vitrine" htmlFor="name">
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Jardim da Ana"
          maxLength={80}
          required
        />
      </Field>

      <Field
        label="Endereço da vitrine"
        htmlFor="slug"
        hint={
          <>
            Seu link: <span className="font-medium text-ink">{baseUrl}/{shownSlug || "sua-vitrine"}</span>
            {store && slug !== store.slug && (
              <span className="mt-1 block text-clay">Atenção: o link antigo deixará de funcionar.</span>
            )}
          </>
        }
      >
        <Input
          id="slug"
          name="slug"
          value={shownSlug}
          onChange={(event) => {
            setSlugEdited(true);
            setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
          }}
          autoCapitalize="none"
          autoCorrect="off"
          maxLength={40}
          required
        />
      </Field>

      <Field label="Descrição" htmlFor="description" hint="Uma frase sobre o seu trabalho, onde você entrega, etc.">
        <Textarea
          id="description"
          name="description"
          defaultValue={store?.description ?? ""}
          placeholder="Terrários e suculentas feitos à mão em Recife. Entrega na Região Metropolitana."
          maxLength={500}
        />
      </Field>

      <Field label="WhatsApp" htmlFor="whatsapp">
        <Input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          defaultValue={store?.whatsapp ? formatWhatsapp(store.whatsapp) : ""}
          placeholder="(81) 99999-1234"
        />
      </Field>

      <Field label="Instagram" htmlFor="instagram">
        <Input
          id="instagram"
          name="instagram"
          defaultValue={store?.instagram ? `@${store.instagram}` : ""}
          placeholder="@seuperfil"
          autoCapitalize="none"
          autoCorrect="off"
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">Por onde quer receber os pedidos?</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "whatsapp", label: "WhatsApp", Icon: WhatsappIcon },
              { value: "instagram", label: "Direct do Instagram", Icon: InstagramIcon },
            ] as const
          ).map(({ value, label, Icon }) => (
            <label
              key={value}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center text-sm transition-colors ${
                channel === value ? "border-moss bg-leaf text-moss-dark" : "border-line bg-surface text-muted"
              }`}
            >
              <input
                type="radio"
                name="contact_channel"
                value={value}
                checked={channel === value}
                onChange={() => setChannel(value)}
                className="sr-only"
              />
              <Icon width={24} height={24} />
              {label}
            </label>
          ))}
        </div>
        <p className="text-sm text-muted">
          {channel === "whatsapp"
            ? "O cliente toca em “Pedir” e abre uma conversa com a mensagem do produto já escrita."
            : "O cliente toca em “Pedir”, a mensagem do produto é copiada e o Direct do seu perfil abre."}
        </p>
      </fieldset>

      <FormMessage state={state} />
      <SubmitButton pending={pending} pendingText="Salvando…">{store ? "Salvar alterações" : "Criar vitrine"}</SubmitButton>
    </form>
  );
}
