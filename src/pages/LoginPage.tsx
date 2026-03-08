import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Revisa tus credenciales.');
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row font-sans selection:bg-red-600/30">
      {/* SECCIÓN IZQUIERDA: BRANDING PREMIUM */}
      <div className="lg:w-1/2 relative overflow-hidden flex items-center justify-center p-12 border-b lg:border-b-0 lg:border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent opacity-50" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <div className="mb-8 inline-block relative">
            <div className="w-32 h-32 bg-gradient-to-tr from-red-600 to-orange-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.3)] rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <div className="w-0 h-0 border-t-[20px] border-t-transparent border-l-[35px] border-l-white border-b-[20px] border-b-transparent ml-2" />
            </div>
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter mb-2">
            EZEH<span className="text-red-600">ACADEMY</span>
          </h1>
          <p className="text-zinc-500 uppercase tracking-[0.5em] text-[10px] font-bold">Solo Acceso Privado</p>
        </motion.div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-[#080808]">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 italic">Acceso Estudiantes</h2>
            <div className="h-1 w-12 bg-red-600" />
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wider"
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="CORREO ELECTRÓNICO"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-red-600/50 transition-all text-sm font-bold placeholder:text-zinc-700 tracking-widest uppercase"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="CONTRASEÑA"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-5 pl-14 pr-14 outline-none focus:border-red-600/50 transition-all text-sm font-bold placeholder:text-zinc-700 tracking-widest uppercase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:text-white transition-colors italic">¿Olvidaste?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-2xl transition-all shadow-2xl shadow-red-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Entrar a la Academia <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em] italic">
            100% SEGURO • EZEH PROTOCOL
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
