"use client";

import { updatePassword } from "../actions";
import { Field, FormMessage, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { useFormAction } from "@/lib/use-form-action";

export default function NewPasswordPage() {
  const { state, onSubmit, pending } = useFormAction(updatePassword);

  return (
    <>
      <title>Nova senha · Cultiva Digital</title>
      <h1 className="font-display text-3xl tracking-tight">Crie uma nova senha</h1>
      <p className="mt-2 mb-8 text-muted">Depois disso você já entra direto no painel.</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Field label="Nova senha" htmlFor="password" hint="Pelo menos 6 caracteres.">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={6} required />
        </Field>
        <FormMessage state={state} />
        <SubmitButton pending={pending} pendingText="Salvando…">Salvar senha</SubmitButton>
      </form>
    </>
  );
}
