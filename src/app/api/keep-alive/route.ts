import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Chamada uma vez por dia pelo cron da Vercel (vercel.json).
 * No plano grátis, o Supabase pausa o projeto depois de ~7 dias sem acesso;
 * esta consulta simples conta como atividade e mantém o banco no ar.
 */
export async function GET(request: NextRequest) {
  // Se CRON_SECRET estiver configurado na Vercel, só o cron (que envia esse segredo) pode chamar.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { error } = await createPublicClient().from("stores").select("id").limit(1);
  if (error) {
    // Com o banco fora do ar, a mensagem pode ser uma página HTML inteira; guarda só o começo.
    const message = error.message.slice(0, 200);
    console.error("keep-alive: falha ao consultar o Supabase:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
