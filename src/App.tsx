import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShieldAlert, Home, Loader2 } from 'lucide-react';
import { supabase, ADMIN_EMAIL } from './lib/supabase';
import { User } from './types';

// IMPORTACIONES CORREGIDAS (Asegúrate de que los nombres de archivo coincidan exactamente)
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UpdatePassword from './pages/UpdatePassword';

// HACK SUPREMO: Importación dinámica para evitar que el build se rompa si el archivo falta físicamente
const AdminPage = lazy(() => import('./pages/AdminPage').catch(() => ({ 
  default: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <ShieldAlert size={50} className="text-yellow-500 mb-4" />
      <h2 className="text-xl font-black">MÓDULO ADMIN NO ENCONTRADO</h2>
      <p className="text-gray-500 text-sm">Verifica que el archivo src/pages/AdminPage.tsx exista.</p>
    </div>
  ) 
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Iniciando Protocolo EZEH</span>
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
      <p className="text-gray-500 max-w-md mb-8 text-sm font-medium">No tienes privilegios de administrador.</p>
      <a href="/" className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all inline-flex items-center">
        <Home size={18} className="mr-2"/> Ir al Inicio
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
            element={user ? <Dashboard user={user} onLogout={() => supabase.auth.signOut()} /> : <Navigate to="/login" replace />} 
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
