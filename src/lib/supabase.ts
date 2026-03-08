import { createClient } from '@supabase/supabase-js';

// Reemplaza esto con tu URL de Supabase (la que termina en .supabase.co)
// Si no la tienes a mano, búscala en tu Dashboard de Supabase -> Project Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uqkwfmgmzivbefyanpiu.supabase.co'; 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('⚠️ ERROR: No se detecta la VITE_SUPABASE_ANON_KEY en las variables de entorno.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');

// Tu email de administrador
export const ADMIN_EMAIL = 'ezehcontactooficial@gmail.com';
