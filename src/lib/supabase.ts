import { createClient } from '@supabase/supabase-js';

// FORZAMOS LA URL DIRECTAMENTE (Sin depender de variables de entorno para la URL)
const supabaseUrl = 'https://uqkwfmgmzivbefyanpiu.supabase.co';

// La Key sí la mantenemos de Vercel por seguridad, o puedes pegarla aquí si quieres probar rápido
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('⚠️ ERROR CRÍTICO: No se encontró VITE_SUPABASE_ANON_KEY en Vercel.');
}

// Creamos el cliente con una validación simple para que no rompa la App
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey || 'SIN_KEY_DETECTADA' 
);

// Tu email de administrador
export const ADMIN_EMAIL = 'ezehcontactooficial@gmail.com';
