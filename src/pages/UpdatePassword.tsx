import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Verificar si hay una sesión activa (el link de recuperación crea una sesión temporal)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6 selection:bg-red-600/30">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-2xl mb-6">
            <Lock className="text-red-600" size={32} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Nueva Contraseña</h1>
          <p className="text-zinc-500 text-xs mt-2 uppercase tracking-[0.2em]">Actualiza tus credenciales de acceso</p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <CheckCircle2 className="text-green-500 mx-auto mb-4" size={48} />
              <h2 className="text-xl font-black uppercase italic">¡Éxito Total!</h2>
              <p className="text-zinc-400 text-xs mt-2">Tu contraseña ha sido actualizada.</p>
              <p className="text-zinc-600 text-[10px] mt-8 uppercase font-bold tracking-widest">Redirigiendo al panel...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-red-600/10 border border-red-600/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-wider"
                >
                  <AlertCircle size={16} /> {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-zinc-600 group-focus-within:text-red-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="NUEVA CONTRASEÑA"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-14 outline-none focus:border-red-600/50 transition-all text-sm font-bold placeholder:text-zinc-700 uppercase tracking-widest"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-5 flex items-center text-zinc-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-zinc-600 group-focus-within:text-red-600 transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="CONFIRMAR CONTRASEÑA"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-14 outline-none focus:border-red-600/50 transition-all text-sm font-bold placeholder:text-zinc-700 uppercase tracking-widest"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-red-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Guardar Nueva Contraseña'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-12 text-center text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] italic opacity-50">
          EZEH ACADEMY SECURITY PROTOCOL
        </p>
      </motion.div>
    </div>
  );
};

export default UpdatePassword;
