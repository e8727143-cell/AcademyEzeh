import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Intentando login para:", email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        alert("ERROR DE SUPABASE: " + error.message);
      } else if (data.user) {
        alert("¡LOGIN EXITOSO! Redirigiendo...");
        window.location.href = '/dashboard';
      } else {
        alert("Respuesta extraña: No hay error pero tampoco usuario.");
      }
    } catch (err: any) {
      alert("ERROR CRÍTICO DE RED: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
      <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-3xl border border-white/10 w-full max-w-md">
        <h1 className="text-2xl font-black mb-6 uppercase italic text-center">EZEH ACADEMY</h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="CORREO"
            className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-red-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="CONTRASEÑA"
            className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-red-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 py-4 rounded-xl font-black uppercase hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {loading ? "CONECTANDO..." : "ENTRAR AHORA"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
