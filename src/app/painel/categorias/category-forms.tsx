"use client";

import { useActionState, useState } from "react";
import { Button, FormMessage, Input } from "@/components/ui";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import type { Category } from "@/lib/types";
import { createCategory, deleteCategory, renameCategory } from "../actions";

export function NewCategoryForm({ suggestions }: { suggestions: string[] }) {
  const [state, action] = useActionState(createCategory, undefined);

  return (
    <div className="flex flex-col gap-3">
      {/* O React limpa o formulário sozinho depois que a action termina. */}
      <form action={action} className="flex gap-2">
        <label htmlFor="new-category" className="sr-only">
          Nova categoria
        </label>
        <Input id="new-category" name="name" placeholder="Nova categoria" maxLength={40} required />
        <SubmitButton pendingText="…" className="shrink-0 px-5">
          <PlusIcon width={18} height={18} /> Criar
        </SubmitButton>
      </form>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Sugestões:</span>
          {suggestions.map((name) => (
            <form key={name} action={action}>
              <input type="hidden" name="name" value={name} />
              <button className="h-9 rounded-full border border-line bg-surface px-3.5 text-sm text-ink transition-colors hover:border-moss/40 hover:bg-leaf">
                + {name}
              </button>
            </form>
          ))}
        </div>
      )}

      <FormMessage state={state} />
    </div>
  );
}

export function CategoryRow({ category, productCount }: { category: Category; productCount: number }) {
  const [state, action] = useActionState(renameCategory, undefined);
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <li className="flex flex-col gap-3 bg-clay-soft p-4">
        <p className="text-sm text-clay">
          Excluir “{category.name}”?
          {productCount > 0 &&
            ` ${productCount === 1 ? "O produto dela continua" : `Os ${productCount} produtos dela continuam`} na vitrine, só que sem categoria.`}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="h-10 flex-1" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
          <form action={deleteCategory} className="flex-1">
            <input type="hidden" name="id" value={category.id} />
            <SubmitButton pendingText="Excluindo…" className="h-10 w-full bg-clay! hover:bg-clay/90!">
              Excluir
            </SubmitButton>
          </form>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 p-3">
      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="id" value={category.id} />
        <label htmlFor={`category-${category.id}`} className="sr-only">
          Nome da categoria
        </label>
        <Input
          id={`category-${category.id}`}
          name="name"
          defaultValue={category.name}
          maxLength={40}
          required
          className="h-11 border-transparent bg-transparent focus:bg-surface"
          onBlur={(event) => {
            if (event.currentTarget.value.trim() !== category.name) event.currentTarget.form?.requestSubmit();
          }}
        />
        <span className="shrink-0 text-sm text-muted">
          {productCount} {productCount === 1 ? "produto" : "produtos"}
        </span>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Excluir ${category.name}`}
          className="grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-clay-soft hover:text-clay"
        >
          <TrashIcon width={18} height={18} />
        </button>
      </form>
      {state?.error && <FormMessage state={state} />}
    </li>
  );
}
