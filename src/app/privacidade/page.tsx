import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Aviso de privacidade" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <Logo />
      <article className="mt-10 flex flex-col gap-5 leading-relaxed text-ink/85 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ink">
        <h1 className="font-display text-3xl tracking-tight text-ink">Aviso de privacidade</h1>
        <p>
          O Cultiva Digital é uma vitrine on-line gratuita desenvolvida como projeto de extensão universitária. Este
          aviso explica, de forma simples, quais dados usamos e por quê, conforme a Lei Geral de Proteção de Dados
          (Lei nº 13.709/2018).
        </p>

        <h2>Quem vende (contas)</h2>
        <p>
          Coletamos apenas o necessário para a vitrine funcionar: e-mail e senha (para acessar a conta), nome da
          vitrine, descrição, WhatsApp e/ou Instagram (para os clientes entrarem em contato) e as fotos e
          informações dos produtos. O nome, a descrição, os contatos e os produtos ficam <strong>públicos</strong>{" "}
          na página da vitrine, porque esse é o objetivo do serviço. O e-mail não é exibido.
        </p>

        <h2>Quem visita a vitrine</h2>
        <p>
          Visitantes não precisam criar conta e não coletamos dados pessoais deles. Ao tocar em “Quero este”, a
          conversa acontece diretamente no WhatsApp ou no Instagram, fora do Cultiva Digital, e segue as regras de
          privacidade desses serviços.
        </p>

        <h2>Onde os dados ficam</h2>
        <p>
          Os dados são armazenados no Supabase (banco de dados e fotos) e o site é hospedado na Vercel. Não
          vendemos nem compartilhamos dados com terceiros para publicidade.
        </p>

        <h2>Seus direitos</h2>
        <p>
          Você pode editar ou apagar seus produtos e informações a qualquer momento pelo painel. Para excluir sua
          conta e todos os dados, ou para tirar dúvidas, fale com a responsável pelo projeto.
        </p>
      </article>
    </main>
  );
}
