import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { User } from './types';
import { supabase, ADMIN_EMAIL } from './lib/supabase';
import { ShieldAlert, Home, Loader2 } from 'lucide-react';

// Carga perezosa para evitar errores de build si los archivos no están presentes
const AdminPage = lazy(() => import('./pages/AdminPage').catch(() => ({ 
  default: () => <div className="min-h-screen bg-black" /> 
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
      fullName: supabaseUser.user_metadata?.full_name || 'Miembro Academia',
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
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

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
