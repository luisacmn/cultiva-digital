import type { Metadata } from "next";
import Link from "next/link";
import { isSignupOpen } from "@/lib/storefront";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/entrar">) {
  const [{ erro }, signupOpen] = await Promise.all([searchParams, isSignupOpen()]);

  return (
    <>
      <h1 className="font-display text-3xl tracking-tight">Que bom te ver de novo</h1>
      <p className="mt-2 mb-8 text-muted">Entre para cuidar da sua vitrine.</p>
      <LoginForm linkError={erro === "link"} />
      <div className="mt-6 flex flex-col gap-3 text-center text-sm text-muted">
        <Link href="/recuperar-senha" className="underline-offset-4 hover:underline">
          Esqueci minha senha
        </Link>
        {signupOpen && (
          <p>
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-moss underline-offset-4 hover:underline">
              Criar minha vitrine
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
