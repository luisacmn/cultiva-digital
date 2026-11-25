# Cultiva Digital

Vitrine on-line gratuita para quem vende plantas — MVP do projeto de extensão (UCB).

- **Área deslogada:** a página inicial (`/`) mostra direto a vitrine da MEI (definida por `HOME_STORE_SLUG`, ou a primeira vitrine criada); cada vitrine também tem seu endereço próprio (`/{endereco}`), com busca, filtro por categoria e botão de pedido pelo WhatsApp ou Direct do Instagram.
- **Área logada (`/painel`):** cadastro/login, dados da vitrine, produtos (foto, nome, preço, descrição, disponibilidade) e categorias.

Stack: Next.js 16 + Supabase (Auth, Postgres com RLS, Storage).

## Como rodar

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole e rode, nesta ordem, o conteúdo de cada arquivo em `supabase/migrations/` (`20261024000000_init.sql` e depois `20261025000000_store_logo.sql`).
3. Para a demonstração, desligue a confirmação de e-mail: **Authentication → Sign In / Providers → Email → Confirm email** (desmarcar). Assim o cadastro entra direto no painel.
4. Copie `.env.example` para `.env.local` e preencha com a URL e a chave `anon` (**Project Settings → API**).
5. `npm install` e `npm run dev` → http://localhost:3000

## Uma vendedora por enquanto

O cadastro só fica aberto até a primeira vitrine ser criada; depois disso `/cadastro` leva ao login e novos cadastros são recusados. Para abrir a plataforma para outras vendedoras no futuro, defina `ALLOW_SIGNUPS=true` (e, se preferir, `HOME_STORE_SLUG` para escolher qual vitrine aparece na página inicial).

## Publicar (Vercel)

Importe o repositório na Vercel, configure as mesmas variáveis de ambiente (com `NEXT_PUBLIC_SITE_URL` = URL do site) e, no Supabase, adicione essa URL em **Authentication → URL Configuration**.

No plano grátis, o Supabase pausa o projeto depois de ~7 dias sem acesso (o site passa a dar erro em tudo que usa o banco). Para evitar isso, o `vercel.json` agenda um cron diário que chama `/api/keep-alive`, que faz uma consulta simples ao banco. Opcional: defina `CRON_SECRET` na Vercel para que só o cron consiga chamar essa rota. Se o projeto chegar a ser pausado, basta abrir o painel do Supabase e clicar em **Resume project**.

## Teste de ponta a ponta

Com o site rodando (`npm run dev`), `npx playwright test` percorre o fluxo inteiro num celular simulado: a vendedora cria a vitrine, categorias e produtos, e um visitante busca, filtra, monta o carrinho e gera o pedido de WhatsApp. O teste usa uma conta de demonstração própria, apaga a vitrine dela no final e salva os prints em `docs/screens/`.
