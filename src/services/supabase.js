import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isMissing = !supabaseUrl || !supabaseAnonKey;

if (isMissing) {
  console.warn(
    '⚠️ Faltan variables de entorno de Supabase.\n' +
    'Crea un archivo .env con:\n' +
    '  VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=tu-anon-key\n\n' +
    'La app funcionará en modo demo sin conexión a Supabase.'
  );
}

// Create client with placeholder values if env vars are missing (demo mode)
export const supabase = isMissing
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

export const isDemoMode = isMissing;
