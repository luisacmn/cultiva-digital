"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Button, Field, FormMessage, Input, Select, Textarea } from "@/components/ui";
import { ImageIcon } from "@/components/icons";
import { compressImage } from "@/lib/image";
import { priceToInput } from "@/lib/format";
import { BUCKET, imageUrl } from "@/lib/links";
import { createClient } from "@/lib/supabase/client";
import type { Category, FormState, Product } from "@/lib/types";
import { saveProduct } from "../actions";

export function ProductForm({
  product,
  categories,
  userId,
}: {
  product?: Product;
  categories: Category[];
  userId: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl(product?.image_path ?? null));
  const [removedImage, setRemovedImage] = useState(false);
  const [available, setAvailable] = useState(product?.available ?? true);
  const [state, setState] = useState<FormState>();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"idle" | "photo" | "saving">("idle");
  const fileInput = useRef<HTMLInputElement>(null);

  function pickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      setState({ error: "Escolha um arquivo de imagem." });
      return;
    }
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setRemovedImage(false);
    setState(undefined);
  }

  function removePhoto() {
    setFile(null);
    setPreview(null);
    setRemovedImage(true);
    if (fileInput.current) fileInput.current.value = "";
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      setState(undefined);
      let imagePath = removedImage ? null : (product?.image_path ?? null);

      if (file) {
        setStep("photo");
        try {
          const blob = await compressImage(file);
          const extension = blob.type === "image/webp" ? "webp" : "jpg";
          const path = `${userId}/${crypto.randomUUID()}.${extension}`;
          const { error } = await createClient()
            .storage.from(BUCKET)
            .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
          if (error) throw error;
          imagePath = path;
        } catch {
          setStep("idle");
          setState({ error: "Não conseguimos enviar a foto. Verifique a internet e tente de novo." });
          return;
        }
      }

      setStep("saving");
      const result = await saveProduct({
        id: product?.id,
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        price: String(formData.get("price") ?? ""),
        categoryId: String(formData.get("category_id") ?? ""),
        available,
        imagePath,
      });
      // Só volta aqui se houve erro; no sucesso a action redireciona.
      setStep("idle");
      setState(result);
    });
  }

  return (
    <form action={submit} className="flex flex-col gap-6">
      <div>
        <input
          ref={fileInput}
          id="photo"
          type="file"
          accept="image/*"
          onChange={pickFile}
          className="sr-only"
        />
        {preview ? (
          <div className="relative overflow-hidden rounded-card border border-line bg-leaf">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Foto do produto" className="aspect-square w-full object-cover" />
            <div className="absolute inset-x-3 bottom-3 flex gap-2">
              <label
                htmlFor="photo"
                className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-full bg-surface/95 text-sm font-medium text-ink shadow-sm"
              >
                Trocar foto
              </label>
              <button
                type="button"
                onClick={removePhoto}
                className="h-11 rounded-full bg-surface/95 px-4 text-sm text-clay shadow-sm"
              >
                Remover
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="photo"
            className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-line bg-surface text-muted transition-colors hover:border-moss/50 hover:text-moss"
          >
            <span className="grid size-14 place-items-center rounded-full bg-leaf text-moss">
              <ImageIcon width={26} height={26} />
            </span>
            <span className="text-[15px] font-medium">Adicionar foto</span>
            <span className="text-sm">Da galeria ou da câmera</span>
          </label>
        )}
      </div>

      <Field label="Nome" htmlFor="name">
        <Input id="name" name="name" defaultValue={product?.name} placeholder="Ex.: Terrário de vidro médio" maxLength={80} required />
      </Field>

      <Field label="Preço" htmlFor="price" hint="Deixe vazio para mostrar “sob consulta”.">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">R$</span>
          <Input
            id="price"
            name="price"
            inputMode="decimal"
            defaultValue={priceToInput(product?.price ?? null)}
            placeholder="0,00"
            className="pl-11"
          />
        </div>
      </Field>

      <Field
        label="Categoria"
        htmlFor="category_id"
        hint={
          <>
            Precisa de outra?{" "}
            <Link href="/painel/categorias" className="text-moss underline underline-offset-4">
              Gerenciar categorias
            </Link>
          </>
        }
      >
        <Select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""}>
          <option value="">Sem categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Descrição" htmlFor="description" hint="Tamanho, cuidados, o que vem junto…">
        <Textarea id="description" name="description" defaultValue={product?.description ?? ""} maxLength={1000} />
      </Field>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5">
        <span>
          <span className="block text-[15px] font-medium">Disponível para venda</span>
          <span className="block text-sm text-muted">
            {available ? "Aparece normalmente na vitrine." : "Aparece como “esgotado”."}
          </span>
        </span>
        <input
          type="checkbox"
          checked={available}
          onChange={(event) => setAvailable(event.target.checked)}
          className="peer sr-only"
        />
        <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-moss peer-focus-visible:ring-4 peer-focus-visible:ring-leaf after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
      </label>

      <FormMessage state={state} />

      <div className="sticky bottom-0 -mx-5 border-t border-line bg-paper/95 px-5 py-4 backdrop-blur">
        <Button type="submit" disabled={pending} className="w-full">
          {step === "photo" ? "Enviando foto…" : step === "saving" ? "Salvando…" : product ? "Salvar alterações" : "Publicar produto"}
        </Button>
      </div>
    </form>
  );
}
