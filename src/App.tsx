import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { User } from './types';
import { supabase, ADMIN_EMAIL } from './lib/supabase';
import { ShieldAlert, Home, Loader2 } from 'lucide-react';

// Importación dinámica para evitar errores si el archivo no existe en el commit inicial
const AdminPage = lazy(() => import('./pages/AdminPage').catch(() => ({ 
  default: () => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <ShieldAlert size={48} className="text-red-600 mb-4" />
      <h1 className="text-xl font-black">ARCHIVO ADMINPAGE.TSX NO DETECTADO</h1>
      <p className="text-zinc-500 text-sm">Sube el archivo a src/pages/AdminPage.tsx para activar este módulo.</p>
    </div>
  ) 
})));

const UpdatePassword = lazy(() => import('./pages/UpdatePassword').catch(() => ({ 
  default: () => <div className="min-h-screen bg-black" /> 
})));

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        mapSupabaseUser(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de estado (Login, Logout, Auto-refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        mapSupabaseUser(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUser = (supabaseUser: any) => {
    const role = supabaseUser.email === ADMIN_EMAIL ? 'admin' : 'student';
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: role as 'admin' | 'student',
      fullName: supabaseUser.user_metadata?.full_name || 'Estudiante Premium',
      progress: []
    });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Iniciando Protocolo EZEH</span>
        </div>
      </div>
    );
  }

  const AccessDenied = () => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert size={40} className="text-red-600" />
      </div>
      <h1 className="text-3xl font-black mb-4 uppercase italic text-white">ACCESO DENEGADO</h1>
      <p className="text-gray-500 max-w-md mb-8 text-sm font-medium">No tienes privilegios de administrador para esta sección.</p>
      <a href="/" className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all inline-flex items-center">
        <Home size={18} className="mr-2"/> Volver al Panel
      </a>
    </div>
  );

  return (
    <Router>
      <Suspense fallback={<div className="bg-black min-h-screen" />}>
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
              user ? (
                user.role === 'admin' ? <AdminPage /> : <AccessDenied />
              ) : <Navigate to="/login" replace />
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
