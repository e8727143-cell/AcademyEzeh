import { createClient } from '@supabase/supabase-js';

// Estas variables se sacan de las Environment Variables de Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERROR: Faltan las variables de entorno de Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email del administrador para control de acceso
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
