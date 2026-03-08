import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("Error: " + error.message);
      }
      // El App.tsx detectará el cambio automáticamente y te redirigirá
    } catch (err: any) {
      alert("Error crítico de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        
        {/* Branding */}
        <div className="p-12 flex flex-col items-center justify-center bg-gradient-to-br from-red-600/10 to-transparent">
          <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center mb-6 rotate-3 shadow-lg shadow-red-600/20">
             <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-1" />
          </div>
          <h1 className="text-4xl font-black italic italic tracking-tighter text-white">EZEH<span className="text-red-600">ACADEMY</span></h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] mt-2 font-bold">Acceso Exclusivo</p>
        </div>

        {/* Formulario */}
        <div className="p-12 bg-zinc-900/30">
          <h2 className="text-white font-black uppercase italic tracking-widest mb-8 border-l-4 border-red-600 pl-4">Entrar</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="email"
              placeholder="CORREO ELECTRÓNICO"
              className="w-full bg-black border border-white/5 p-5 rounded-2xl text-sm font-bold focus:border-red-600 outline-none transition-all uppercase tracking-widest text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="CONTRASEÑA"
              className="w-full bg-black border border-white/5 p-5 rounded-2xl text-sm font-bold focus:border-red-600 outline-none transition-all uppercase tracking-widest text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
