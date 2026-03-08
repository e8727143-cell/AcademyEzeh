import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { User } from './types';
import { supabase, ADMIN_EMAIL } from './lib/supabase';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión al cargar
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        mapSupabaseUser(session.user);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="text-red-600 animate-spin" size={40} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Si hay usuario, el login te manda al dashboard */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        
        {/* Si NO hay usuario, el dashboard te manda al login de forma obligatoria */}
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} onLogout={() => supabase.auth.signOut()} /> : <Navigate to="/login" replace />} 
        />

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
