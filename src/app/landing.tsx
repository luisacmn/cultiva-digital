import Link from "next/link";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";
import { ImageIcon, ShareIcon, WhatsappIcon } from "@/components/icons";

const steps = [
  {
    Icon: ImageIcon,
    title: "Publique pelo celular",
    text: "Foto, nome, preço e categoria. Leva menos de um minuto por produto.",
  },
  {
    Icon: ShareIcon,
    title: "Compartilhe um link só",
    text: "Coloque na bio do Instagram. Seus clientes buscam e filtram por categoria.",
  },
  {
    Icon: WhatsappIcon,
    title: "Receba os pedidos",
    text: "O cliente toca em “Quero este” e a conversa abre no seu WhatsApp ou Direct.",
  },
];

export function Landing() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5">
      <header className="flex items-center justify-between py-5">
        <Logo />
        <Link href="/entrar" className="rounded-full px-4 py-2 text-sm text-moss hover:bg-leaf">
          Entrar
        </Link>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center py-16 text-center sm:py-24">
          <p className="rounded-full bg-leaf px-4 py-1.5 text-sm text-moss-dark">Grátis para quem está começando</p>
          <h1 className="mt-6 max-w-2xl font-display text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl">
            Suas plantas merecem uma vitrine.
          </h1>
          <p className="mt-5 max-w-md text-lg text-pretty text-muted">
            Monte o catálogo dos seus terrários e plantas, compartilhe o link no Instagram e receba pedidos direto
            no WhatsApp.
          </p>
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <ButtonLink href="/cadastro">Criar minha vitrine</ButtonLink>
            <ButtonLink href="/entrar" variant="secondary">
              Já tenho conta
            </ButtonLink>
          </div>
        </section>

        <section className="grid gap-3 pb-20 sm:grid-cols-3">
          {steps.map(({ Icon, title, text }, index) => (
            <div key={title} className="rounded-card border border-line bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-full bg-leaf text-moss">
                  <Icon width={20} height={20} />
                </span>
                <span className="font-display text-2xl text-line">0{index + 1}</span>
              </div>
              <h2 className="mt-5 font-display text-xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="flex justify-center border-t border-line py-8">
        <Link href="/privacidade" className="text-xs text-muted hover:text-moss">
          Aviso de privacidade
        </Link>
      </footer>
    </div>
  );
}
