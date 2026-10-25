"use client";

import Link from "next/link";
import { requestPasswordReset } from "../actions";
import { Field, FormMessage, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { useFormAction } from "@/lib/use-form-action";

export default function ForgotPasswordPage() {
  const { state, onSubmit, pending } = useFormAction(requestPasswordReset);

  return (
    <>
      <title>Recuperar senha · Cultiva Digital</title>
      <h1 className="font-display text-3xl tracking-tight">Esqueceu a senha?</h1>
      <p className="mt-2 mb-8 text-muted">Informe seu e-mail e enviaremos um link para criar uma nova.</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Field label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
        </Field>
        <FormMessage state={state} />
        {!state?.message && <SubmitButton pending={pending} pendingText="Enviando…">Enviar link</SubmitButton>}
      </form>
      <Link href="/entrar" className="mt-6 text-center text-sm text-muted underline-offset-4 hover:underline">
        Voltar para o login
      </Link>
    </>
  );
}
