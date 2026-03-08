import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { User } from './types';
import { supabase, ADMIN_EMAIL } from './lib/supabase';
import { Loader2, AlertTriangle, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState<string>("Iniciando sistema...");

  useEffect(() => {
    const checkConnection = async () => {
      setDebugLog("Verificando conexión con Supabase...");
      
      // Timeout de seguridad: Si en 6 segundos no hay respuesta, forzamos error
      const timeout = setTimeout(() => {
        if (loading) {
          setDebugLog("Error: Tiempo de espera agotado. Supabase no responde.");
          setLoading(false);
        }
      }, 6000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(timeout);

        if (error) {
          setDebugLog(`Error de Supabase: ${error.message}`);
          setLoading(false);
          return;
        }

        if (session) {
          setDebugLog("Sesión encontrada. Cargando perfil...");
          mapSupabaseUser(session.user);
        } else {
          setDebugLog("No hay sesión. Redirigiendo a Login.");
          setLoading(false);
        }
      } catch (err: any) {
        setDebugLog(`Error crítico: ${err.message}`);
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  const mapSupabaseUser = (supabaseUser: any) => {
    const role = supabaseUser.email === ADMIN_EMAIL ? 'admin' : 'student';
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: role as 'admin' | 'student',
      fullName: supabaseUser.user_metadata?.full_name || 'Usuario',
      progress: []
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic animate-pulse">
          {debugLog}
        </p>
      </div>
    );
  }

  // Si después de cargar no hay usuario y hay un log de error, mostramos panel de auxilio
  if (!user && debugLog.includes("Error")) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center">
        <AlertTriangle size={50} className="text-yellow-500 mb-6" />
        <h1 className="text-white font-black uppercase italic text-2xl mb-2">Protocolo de Emergencia</h1>
        <div className="bg-zinc-900 p-4 rounded-xl border border-white/10 mb-6 w-full max-w-md">
          <p className="text-red-500 font-mono text-xs">{debugLog}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-xs"
        >
          <RefreshCcw size={16} /> Reintentar Conexión
        </button>
        <p className="text-zinc-600 text-[9px] mt-8 uppercase tracking-widest max-w-xs">
          Asegúrate de que la URL de Supabase en Vercel sea correcta y no tenga espacios.
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
