import { useState, useEffect } from 'react';
import { useBoxing } from '../context/BoxingContext';
import StudentList from '../components/StudentList';
import StudentForm from '../components/StudentForm';
import AttendanceList from '../components/AttendanceList';
import TrainingManager from '../components/TrainingManager';
import FinancialModal from '../components/modals/FinancialModal';
import { DollarSign, Share2, User, UserCog, LogOut, X, MessageCircle, Instagram, Facebook, Plus } from 'lucide-react';
import type { Student } from '../types';

const ProfessorDashboard = () => {
  const { addStudent, updateStudent, logout, currentUser, professors, updateProfessor } = useBoxing();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);

  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFinancialOpen, setIsFinancialOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    bio: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    portfolioUrl: ''
  });

  // Social Links State
  const [socialLinks, setSocialLinks] = useState({ whatsapp: '', instagram: '', facebook: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Load current professor's links
  useEffect(() => {
    if (currentUser?.profileId && professors.length > 0) {
      const currentProf = professors.find(p => p.id === currentUser.profileId);
      if (currentProf) {
        setProfileData({
          bio: currentProf.bio || '',
          whatsapp: currentProf.whatsapp || '',
          instagram: currentProf.instagram || '',
          facebook: currentProf.facebook || '',
          portfolioUrl: currentProf.portfolioUrl || ''
        });
        setSocialLinks({
          whatsapp: currentProf.whatsapp || '',
          instagram: currentProf.instagram || '',
          facebook: currentProf.facebook || ''
        });
      }
    }
  }, [currentUser, professors]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.profileId) return;
    setIsSaving(true);
    try {
      await updateProfessor(currentUser.profileId, profileData);
      setIsProfileOpen(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLinks = async () => {
    if (!currentUser?.profileId) return;
    setIsSaving(true);
    try {
      await updateProfessor(currentUser.profileId, socialLinks);
      alert('Links salvos com sucesso!');
    } catch (error) {
      alert('Erro ao salvar links');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddClick = () => {
    setEditingStudent(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id'>) => {
    addStudent(studentData);
    setIsFormOpen(false);
  };

  const handleUpdateStudent = (id: string, studentData: Partial<Student>) => {
    updateStudent(id, studentData);
    setIsFormOpen(false);
  };

  return (
    // PARA ADICIONAR IMAGEM DE FUNDO:
    // 1. Coloque sua imagem na pasta 'public' (ex: fundo-professor.jpg)
    // 2. Descomente a linha 'backgroundImage' abaixo
    <div
      className="min-h-screen bg-slate-900 text-white p-4 md:p-8 bg-cover bg-top relative border-[12px] border-white/5"
      style={{
        backgroundImage: 'url(/bg-professor.jpg)',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel do Professor</h1>
            <p className="text-slate-400">Gerencie seus alunos e treinos</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFinancialOpen(true)}
              className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 rounded-lg transition-colors text-emerald-400"
              title="Financeiro"
            >
              <DollarSign className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSocialOpen(true)}
              className="p-2 bg-pink-500/20 hover:bg-pink-500/40 border border-pink-500/30 rounded-lg transition-colors text-pink-400"
              title="Redes Sociais"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsStudentsOpen(true)}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 rounded-lg transition-colors text-blue-400"
              title="Alunos"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-lg transition-colors text-indigo-200"
              title="Meu Perfil"
            >
              <UserCog className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Financial Summary */}


        {/* Training Management Section */}
        <TrainingManager />

        {/* Attendance Section */}
        <AttendanceList />

      </div>


      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Bio / Trajetória</label>
                  <textarea
                    rows={6}
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Conte sua história, experiências e conquistas..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <h3 className="text-sm font-semibold text-slate-300 border-t border-slate-700 pt-4 mt-2">Redes Sociais</h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp
                    </label>
                    <input
                      type="text"
                      value={profileData.whatsapp}
                      onChange={e => setProfileData({ ...profileData, whatsapp: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Ex: 11999999999"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                      </label>
                      <input
                        type="text"
                        value={profileData.instagram}
                        onChange={e => setProfileData({ ...profileData, instagram: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="@usuario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-500" /> Facebook
                      </label>
                      <input
                        type="text"
                        value={profileData.facebook}
                        onChange={e => setProfileData({ ...profileData, facebook: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Link do perfil"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Link do Portfólio (PDF)</label>
                  <input
                    type="text"
                    value={profileData.portfolioUrl}
                    onChange={e => setProfileData({ ...profileData, portfolioUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: /portfolio-carlos.pdf"
                  />
                  <p className="text-xs text-slate-500 mt-1">Coloque o nome do arquivo que está na pasta public (ex: /portfolio.pdf)</p>
                  <p className="text-xs text-indigo-400 mt-1">
                    💡 Dica: Coloque seu arquivo PDF na pasta <code className="bg-slate-900 px-1 rounded">public</code> do projeto
                  </p>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-700 sticky bottom-0 bg-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Perfil'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Social Links Modal */}
      {isSocialOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Redes Sociais</h2>
              <button onClick={() => setIsSocialOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp
                </label>
                <input
                  type="text"
                  value={socialLinks.whatsapp}
                  onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                  placeholder="Ex: 11999999999"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                </label>
                <input
                  type="text"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  placeholder="Ex: @seu_insta"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-500" /> Facebook
                </label>
                <input
                  type="text"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  placeholder="Link do perfil"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  onClick={() => setIsSocialOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleSaveLinks();
                    setIsSocialOpen(false);
                  }}
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Modal */}
      {isFinancialOpen && (
        <FinancialModal onClose={() => setIsFinancialOpen(false)} />
      )}

      {/* Students Modal */}
      {isStudentsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-900 rounded-2xl w-full max-w-6xl h-[90vh] border border-slate-700 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Gerenciar Alunos</h2>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAddClick}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Aluno
                </button>
                <button onClick={() => setIsStudentsOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <StudentList onEdit={handleEditClick} />
            </div>
          </div>
        </div>
      )}

      {/* Student Form Modal - Rendered last to be on top */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl">
            <StudentForm
              student={editingStudent}
              onSave={handleSaveStudent}
              onUpdate={handleUpdateStudent}
              onClose={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard;
