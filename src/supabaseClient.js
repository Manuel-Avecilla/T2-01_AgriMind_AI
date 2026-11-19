import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y rellena los valores del proyecto Supabase.'
  );
}

export const supabase = createClient(url, anonKey);

// Hasta la Fase 3 no hay interfaz de acceso: en desarrollo se expone el cliente
// para iniciar sesión desde la consola con un usuario de prueba. Desaparece en
// el build de producción porque import.meta.env.DEV es false.
if (import.meta.env.DEV) {
  window.supabase = supabase;
}
