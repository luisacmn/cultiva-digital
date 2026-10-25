import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Client anônimo, sem cookies — para as páginas públicas das vitrines. */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
