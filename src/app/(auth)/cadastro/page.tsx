import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSignupOpen } from "@/lib/storefront";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Criar conta" };

export default async function SignupPage() {
  await connection();
  if (!(await isSignupOpen())) redirect("/entrar");

  return (
    <>
      <h1 className="font-display text-3xl tracking-tight">Crie sua vitrine</h1>
      <p className="mt-2 mb-8 text-muted">É grátis. Em poucos minutos suas plantas estarão on-line.</p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-medium text-moss underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
