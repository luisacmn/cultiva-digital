"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/links";
import { isSignupOpen } from "@/lib/storefront";
import type { FormState } from "@/lib/types";

function translateAuthError(message: string) {
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(message))
    return "Seu e-mail ainda não foi confirmado. Procure o link que enviamos (veja também o spam).";
  if (/already registered|already been registered/i.test(message))
    return "Já existe uma conta com este e-mail. Tente entrar.";
  if (/password should be/i.test(message)) return "A senha precisa ter pelo menos 6 caracteres.";
  if (/rate limit|too many/i.test(message))
    return "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.";
  if (/invalid.*email|email.*invalid/i.test(message)) return "Confira se o e-mail está correto.";
  if (/session missing|session_not_found/i.test(message))
    return "Seu link expirou. Peça um novo em “Esqueci minha senha”.";
  return "Algo deu errado. Tente novamente em instantes.";
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) return { error: "Preencha e-mail e senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateAuthError(error.message) };

  redirect("/painel");
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isSignupOpen())) return { error: "No momento não estamos aceitando novos cadastros." };

  const { email, password } = readCredentials(formData);
  if (!email) return { error: "Informe seu e-mail." };
  if (password.length < 6) return { error: "A senha precisa ter pelo menos 6 caracteres." };
  if (formData.get("consent") !== "on")
    return { error: "Para criar a conta, é preciso concordar com o aviso de privacidade." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/painel` },
  });
  if (error) return { error: translateAuthError(error.message) };

  // Com a confirmação de e-mail desligada no Supabase, a sessão já vem pronta.
  if (data.session) redirect("/painel");

  return {
    message: `Quase lá! Enviamos um link de confirmação para ${email}. Abra o e-mail e toque no link para ativar sua conta.`,
  };
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Informe seu e-mail." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/nova-senha`,
  });
  if (error) return { error: translateAuthError(error.message) };

  return { message: "Se houver uma conta com este e-mail, você vai receber um link para criar uma nova senha." };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "A senha precisa ter pelo menos 6 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translateAuthError(error.message) };

  redirect("/painel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
