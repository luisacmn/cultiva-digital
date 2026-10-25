"use client";

import Link from "next/link";
import { signUp } from "../actions";
import { Field, FormMessage, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { useFormAction } from "@/lib/use-form-action";

export function SignupForm() {
  const { state, onSubmit, pending } = useFormAction(signUp);

  if (state?.message) return <FormMessage state={state} />;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </Field>
      <Field label="Crie uma senha" htmlFor="password" hint="Pelo menos 6 caracteres.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={6} required />
      </Field>
      <label className="flex items-start gap-3 text-sm text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 size-5 accent-moss" />
        <span>
          Li e concordo com o{" "}
          <Link href="/privacidade" target="_blank" className="text-moss underline underline-offset-4">
            aviso de privacidade
          </Link>
          .
        </span>
      </label>
      <FormMessage state={state} />
      <SubmitButton pending={pending} pendingText="Criando conta…">Criar conta</SubmitButton>
    </form>
  );
}
