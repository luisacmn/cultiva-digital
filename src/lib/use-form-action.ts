"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import type { FormState } from "./types";

/**
 * Como useActionState, mas sem o reset automático do React 19:
 * se a action devolver um erro, o que a pessoa digitou continua no formulário.
 * `prepare` roda antes da action (ex.: enviar uma imagem) e pode devolver uma mensagem de erro.
 */
export function useFormAction(
  action: (prev: FormState, formData: FormData) => Promise<FormState>,
  initialState?: FormState,
  prepare?: (formData: FormData) => Promise<string | void>,
) {
  const [state, dispatch, pending] = useActionState(action, initialState);
  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string>();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPrepareError(undefined);

    if (prepare) {
      setPreparing(true);
      const error = await prepare(formData);
      setPreparing(false);
      if (error) {
        setPrepareError(error);
        return;
      }
    }

    startTransition(() => dispatch(formData));
  }

  return { state: prepareError ? { error: prepareError } : state, onSubmit, pending: pending || preparing };
}
