"use client";

import { signIn } from "../actions";
import { Field, FormMessage, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { useFormAction } from "@/lib/use-form-action";

export function LoginForm({ linkError }: { linkError: boolean }) {
  const { state, onSubmit, pending } = useFormAction(
    signIn,
    linkError ? { error: "Este link expirou ou já foi usado. Entre com seu e-mail e senha." } : undefined,
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </Field>
      <Field label="Senha" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending={pending} pendingText="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
