import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// No se reutiliza src/lib/supabase.ts porque depende de import.meta.env (solo existe en Vite).
// Las tablas tienen RLS solo para usuarios autenticados, así que el servidor usa la service role key.
// Esa clave vive únicamente en las variables de entorno de Vercel: nunca llega al navegador.
let cliente: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (cliente) return cliente;

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Faltan variables de entorno de Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }

  cliente = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cliente;
};
