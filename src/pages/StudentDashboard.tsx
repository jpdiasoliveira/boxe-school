import { useBoxing } from '../context/BoxingContext';
import TrainingSchedule from '../components/TrainingSchedule';
import { LogOut, User, CreditCard, Activity, AlertCircle, X, GraduationCap, MessageSquarePlus, Building2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import CoachModal from '../components/modals/CoachModal';
import PaymentAlertModal from '../components/modals/PaymentAlertModal';
import FeedbackModal from '../components/modals/FeedbackModal';
import type { Student } from '../types';

const StudentDashboard = () => {
  const { currentUser, students, logout, getStudentStatus, professors, updateStudent } = useBoxing();
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isSchoolOpen, setIsSchoolOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPaymentAlertOpen, setIsPaymentAlertOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [profileData, setProfileData] = useState({
    phone: '',
    address: '',
    weight: 0,
    height: 0
  });

  // In a real app, we'd fetch the specific student data. 
  // Here we find the student that matches the logged in ID (or mock ID)
  const student = students.find((s: Student) => s.userId === currentUser?.id);

  const status = student ? getStudentStatus(student) : 'active';
  const isOverdue = status === 'overdue';

  // Helper to get school portfolio URL
  const getSchoolPortfolio = () => {
    const schoolProf = professors.find(p => p.name.toLowerCase().includes('dias') || p.name.toLowerCase().includes('school'));
    return schoolProf?.portfolioUrl;
  };

  // Helper to get trainer portfolio URLs
  const getTrainerPortfolios = () => {
    return professors.filter(p => !p.name.toLowerCase().includes('dias') && !p.name.toLowerCase().includes('school'));
  };

  // Handle school button click
  const handleSchoolClick = () => {
    const portfolioUrl = getSchoolPortfolio();
    if (portfolioUrl) {
      window.open(portfolioUrl, '_blank');
    } else {
      setIsSchoolOpen(true);
    }
  };

  // Handle trainer button click
  const handleTrainerClick = () => {
    const trainers = getTrainerPortfolios();
    if (trainers.length === 1 && trainers[0].portfolioUrl) {
      window.open(trainers[0].portfolioUrl, '_blank');
    } else {
      setIsCoachOpen(true);
    }
  };

  useEffect(() => {
    if (student) {
      setProfileData({
        phone: student.phone || '',
        address: student.address || '',
        weight: student.weight || 0,
        height: student.height || 0
      });
    }
  }, [student]);

  useEffect(() => {
    if (isOverdue) {
      setIsPaymentAlertOpen(true);
    }
  }, [isOverdue]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    try {
      await updateStudent(student.id, profileData);
      setIsProfileOpen(false);
      alert('Dados atualizados com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar dados.');
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Conta Inativa</h2>
          <p className="text-slate-400 mb-6">
            Sua conta está pendente ou inativa. Entre em contato com a administração para mais informações.
          </p>
          <button
            onClick={logout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-900 text-white p-4 md:p-8 bg-cover bg-top relative border-[12px] border-white/5"
      style={{
        backgroundImage: 'url(/bg-student.jpg)',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] z-0"></div>

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        {/* Payment Alert Banner */}
        {isOverdue && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-bold text-red-400">Atenção! Mensalidade Vencida</h3>
              <p className="text-sm text-red-200">Sua parcela venceu. Por favor, procure a administração para regularizar.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Olá, {student.name.split(' ')[0]}</h1>
            <p className="text-slate-400">Vamos treinar?</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-lg transition-colors text-indigo-200"
              title="Sugestões e Feedback"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
            <button
              onClick={handleSchoolClick}
              className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-lg transition-colors text-indigo-200"
              title="Conheça a Boxe School"
            >
              <Building2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleTrainerClick}
              className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-lg transition-colors text-indigo-200"
              title="Conheça seu Treinador"
            >
              <GraduationCap className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-lg transition-colors text-indigo-200"
              title="Meu Perfil"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-lg transition-colors text-slate-300 border border-white/10"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Card */}
        <div className={`p-6 rounded-xl border backdrop-blur-md shadow-lg ${isOverdue
          ? 'bg-red-500/20 border-red-500/50'
          : 'bg-emerald-500/20 border-emerald-500/50'
          }`}>
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className={`w-6 h-6 ${isOverdue ? 'text-red-400' : 'text-emerald-400'}`} />
            <h3 className={`font-semibold text-lg ${isOverdue ? 'text-red-400' : 'text-emerald-400'}`}>
              {isOverdue ? 'Pagamento Pendente' : 'Mensalidade em Dia'}
            </h3>
          </div>
          <p className="text-slate-200 text-sm">
            {isOverdue
              ? 'Sua mensalidade venceu. Por favor, regularize para continuar treinando.'
              : `Próximo vencimento: ${student.lastPaymentDate && isValid(parseISO(student.lastPaymentDate)) ? format(parseISO(student.lastPaymentDate), "d 'de' MMMM", { locale: ptBR }) : 'N/A'}`
            }
          </p>
        </div>

        {/* Plan Info */}
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <User className="w-6 h-6" />
            <h3 className="font-semibold text-lg">Seu Plano</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tipo</span>
              <span className="text-white font-medium capitalize">{student.planType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Categoria</span>
              <span className="text-white font-medium capitalize flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {student.athleteType}
              </span>
            </div>
          </div>
        </div>


        {/* Training Schedule */}
        <TrainingSchedule />
      </div>

      {/* Modals */}
      <CoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        professors={professors}
        mode="professor"
      />

      <CoachModal
        isOpen={isSchoolOpen}
        onClose={() => setIsSchoolOpen(false)}
        professors={professors}
        mode="school"
      />

      {/* Profile Edit Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Meus Dados</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Endereço</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Rua, Número, Bairro..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    value={profileData.weight}
                    onChange={e => setProfileData({ ...profileData, weight: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    value={profileData.height}
                    onChange={e => setProfileData({ ...profileData, height: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PaymentAlertModal
        isOpen={isPaymentAlertOpen}
        onClose={() => setIsPaymentAlertOpen(false)}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
};

export default StudentDashboard;
