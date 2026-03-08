import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { User } from './types';
import { supabase, ADMIN_EMAIL } from './lib/supabase';
import { ShieldAlert, Home, Loader2, AlertCircle } from 'lucide-react';

// Carga segura de AdminPage
const AdminPage = lazy(() => import('./pages/AdminPage').catch(() => ({ 
  default: () => <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-black">ERROR: AdminPage.tsx no encontrado</div> 
})));

const UpdatePassword = lazy(() => import('./pages/UpdatePassword').catch(() => ({ 
  default: () => <div className="min-h-screen bg-black" /> 
})));

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Verificar si las variables de entorno existen
        if (!import.meta.env.VITE_SUPABASE_URL) {
          throw new Error("Faltan variables de entorno en Vercel (VITE_SUPABASE_URL)");
        }

        // 1. Verificar sesión inicial
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          mapSupabaseUser(session.user);
        } else {
          setLoading(false);
        }

        // 2. Escuchar cambios de estado
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            mapSupabaseUser(session.user);
          } else {
            setUser(null);
            setLoading(false);
          }
        });

        return () => subscription.unsubscribe();
      } catch (err: any) {
        console.error("Critical Init Error:", err);
        setInitError(err.message);
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const mapSupabaseUser = (supabaseUser: any) => {
    const role = supabaseUser.email === ADMIN_EMAIL ? 'admin' : 'student';
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: role as 'admin' | 'student',
      fullName: supabaseUser.user_metadata?.full_name || 'Miembro Academia',
      progress: []
    });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // PANTALLA DE ERROR CRÍTICO (Si faltan variables de entorno)
  if (initError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center">
        <AlertCircle size={48} className="text-red-600 mb-4" />
        <h1 className="text-white font-black uppercase italic text-xl">Error de Configuración</h1>
        <p className="text-zinc-500 text-sm mt-2 max-w-sm">{initError}</p>
        <p className="text-red-500/50 text-[10px] mt-8 uppercase font-bold">Revisa las Environment Variables en Vercel</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Iniciando Academia</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Suspense fallback={<div className="bg-black min-h-screen flex items-center justify-center"><Loader2 className="text-red-600 animate-spin" /></div>}>
        <Routes>
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/admin" 
            element={
              user && user.role === 'admin' ? <AdminPage /> : <Navigate to="/dashboard" replace />
            } 
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
