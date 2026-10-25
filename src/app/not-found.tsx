import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <Logo />
      <h1 className="mt-10 font-display text-3xl tracking-tight">Não encontramos esta página</h1>
      <p className="mt-3 text-muted">O link pode ter mudado ou o produto não está mais na vitrine.</p>
      <ButtonLink href="/" variant="secondary" className="mt-8">
        Ir para o início
      </ButtonLink>
    </main>
  );
}
