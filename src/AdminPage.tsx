import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, Layout, BookOpen, Video, FileText, 
  ChevronRight, Loader2, ShieldCheck, AlertCircle, ArrowLeft, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Course, Module, Lesson } from '../types';
import { Link } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState<{moduleId: string} | null>(null);
  
  // Form States
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLesson, setNewLesson] = useState({
    title: '',
    video_url: '',
    description: '',
    resources: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules:modules(
          *,
          lessons:lessons(*)
        )
      `)
      .order('order_index', { foreignTable: 'modules', ascending: true });

    if (!error && data) {
      setCourses(data);
      if (data.length > 0) setSelectedCourse(data[0]);
    }
    setLoading(false);
  };

  const handleAddModule = async () => {
    if (!selectedCourse || !newModuleTitle) return;
    const { error } = await supabase
      .from('modules')
      .insert([{ 
        course_id: selectedCourse.id, 
        title: newModuleTitle,
        order_index: selectedCourse.modules?.length || 0 
      }]);

    if (!error) {
      setNewModuleTitle('');
      setIsAddingModule(false);
      fetchCourses();
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!newLesson.title || !newLesson.video_url) return;
    
    // Convertir link de YouTube normal a Embed si es necesario
    let finalUrl = newLesson.video_url;
    if (finalUrl.includes('watch?v=')) {
        finalUrl = finalUrl.replace('watch?v=', 'embed/');
    }

    const { error } = await supabase
      .from('lessons')
      .insert([{ 
        module_id: moduleId, 
        title: newLesson.title,
        video_url: finalUrl,
        description: newLesson.description,
        resources: newLesson.resources,
        order_index: 0
      }]);

    if (!error) {
      setNewLesson({ title: '', video_url: '', description: '', resources: '' });
      setIsAddingLesson(null);
      fetchCourses();
    }
  };

  const handleDelete = async (table: 'modules' | 'lessons', id: string) => {
    if (!window.confirm('¿Confirmas la eliminación definitiva?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) fetchCourses();
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600/30">
      {/* HEADER EZEH */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Panel Alumno</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-sm font-black uppercase tracking-[0.3em] italic">Centro de Mando <span className="text-red-600">ANON</span></h1>
          </div>
          <div className="flex items-center gap-4 bg-red-600/10 border border-red-600/20 px-4 py-2 rounded-full">
            <ShieldCheck size={14} className="text-red-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-red-500">Admin Mode Active</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* SIDEBAR DE CURSOS */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Programas Activos</h2>
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full p-6 rounded-2xl border transition-all text-left group ${
                  selectedCourse?.id === course.id 
                  ? 'bg-white text-black border-white' 
                  : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-black uppercase italic text-sm leading-tight">{course.title}</h3>
                  <ChevronRight size={18} className={selectedCourse?.id === course.id ? 'text-black' : 'text-zinc-700'} />
                </div>
                <p className="mt-2 text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                  {course.modules?.length || 0} Módulos Disponibles
                </p>
              </button>
            ))}
          </div>

          {/* ÁREA DE GESTIÓN */}
          <div className="lg:col-span-8 space-y-8">
            {selectedCourse && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <h2 className="text-4xl font-black uppercase italic leading-none">{selectedCourse.title}</h2>
                    <p className="text-zinc-500 text-xs mt-4 uppercase tracking-[0.2em]">Gestión de contenido modular</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingModule(true)}
                    className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Plus size={16} /> Nuevo Módulo
                  </button>
                </div>

                {/* LISTA DE MÓDULOS */}
                <div className="space-y-6">
                  {isAddingModule && (
                    <div className="bg-zinc-900 p-6 rounded-2xl border border-red-600/30">
                      <input 
                        autoFocus
                        placeholder="TÍTULO DEL MÓDULO..."
                        className="bg-transparent text-xl font-black uppercase italic w-full outline-none"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value.toUpperCase())}
                      />
                      <div className="flex gap-4 mt-6">
                        <button onClick={handleAddModule} className="text-[10px] font-black uppercase bg-white text-black px-4 py-2 rounded-lg">Guardar</button>
                        <button onClick={() => setIsAddingModule(false)} className="text-[10px] font-black uppercase text-zinc-500">Cancelar</button>
                      </div>
                    </div>
                  )}

                  {selectedCourse.modules?.map((module: Module) => (
                    <div key={module.id} className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
                      <div className="p-6 bg-zinc-900/50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Layout size={20} className="text-red-600" />
                          <h3 className="font-black uppercase text-sm tracking-wider">{module.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setIsAddingLesson({ moduleId: module.id })}
                            className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                          >
                            <Plus size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete('modules', module.id)}
                            className="p-2 hover:bg-red-600/20 rounded-lg text-zinc-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* LECCIONES DENTRO DEL MÓDULO */}
                      <div className="p-6 space-y-4">
                        {isAddingLesson?.moduleId === module.id && (
                          <div className="bg-black/40 p-6 rounded-2xl border border-white/10 space-y-4">
                            <input 
                              placeholder="TÍTULO DE LA LECCIÓN"
                              className="bg-transparent border-b border-white/10 w-full py-2 outline-none text-xs font-bold uppercase tracking-widest"
                              value={newLesson.title}
                              onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                            />
                            <input 
                              placeholder="URL DEL VIDEO (YOUTUBE)"
                              className="bg-transparent border-b border-white/10 w-full py-2 outline-none text-[10px] text-zinc-500"
                              value={newLesson.video_url}
                              onChange={e => setNewLesson({...newLesson, video_url: e.target.value})}
                            />
                            <textarea 
                              placeholder="DESCRIPCIÓN (OPCIONAL)"
                              className="bg-transparent border-b border-white/10 w-full py-2 outline-none text-[10px] text-zinc-500 h-20 resize-none"
                              value={newLesson.description}
                              onChange={e => setNewLesson({...newLesson, description: e.target.value})}
                            />
                            <input 
                              placeholder="URL DEL RECURSO/PDF (OPCIONAL)"
                              className="bg-transparent border-b border-white/10 w-full py-2 outline-none text-[10px] text-zinc-500"
                              value={newLesson.resources}
                              onChange={e => setNewLesson({...newLesson, resources: e.target.value})}
                            />
                            <div className="flex gap-4 pt-4">
                              <button onClick={() => handleAddLesson(module.id)} className="bg-red-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase">Publicar Clase</button>
                              <button onClick={() => setIsAddingLesson(null)} className="text-[10px] font-black uppercase text-zinc-500">Cerrar</button>
                            </div>
                          </div>
                        )}

                        {module.lessons?.length === 0 && !isAddingLesson && (
                          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest text-center py-4">Este módulo no tiene lecciones</p>
                        )}

                        {module.lessons?.map((lesson: Lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                <Video size={14} className="text-white" />
                              </div>
                              <div>
                                <h4 className="text-[11px] font-black uppercase tracking-wider">{lesson.title}</h4>
                                <p className="text-[9px] text-zinc-500 truncate max-w-[300px]">{lesson.video_url}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDelete('lessons', lesson.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
