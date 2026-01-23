import { useState, Fragment } from 'react';
import type { Student } from '../types';
import { useBoxing } from '../context/BoxingContext';
import { Trash2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, User, Calendar, Ruler, Weight, Target, DollarSign, Edit2 } from 'lucide-react';
import { format, parseISO, differenceInYears, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StudentListProps {
    onEdit: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ onEdit }) => {
    const { students, deleteStudent, getStudentStatus, updateStudent } = useBoxing();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate || !isValid(parseISO(birthDate))) return 0;
        return differenceInYears(new Date(), parseISO(birthDate));
    };

    const handleTogglePayment = async (student: Student, isOverdue: boolean) => {
        try {
            const action = isOverdue ? 'pagamento realizado' : 'pagamento pendente';
            if (window.confirm(`Marcar como ${action}?`)) {
                let newDate: string;
                if (isOverdue) {
                    // Mark as paid today
                    newDate = new Date().toISOString().split('T')[0];
                } else {
                    // Mark as overdue (set to 2 months ago)
                    const date = new Date();
                    date.setMonth(date.getMonth() - 2);
                    newDate = date.toISOString().split('T')[0];
                }

                // Validate date format
                if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
                    console.error('Invalid date format:', newDate);
                    alert('Erro: Data inválida');
                    return;
                }

                console.log('Updating payment date for student:', student.id, 'to:', newDate);
                await updateStudent(student.id, { lastPaymentDate: newDate });
                console.log('Payment date updated successfully');
            }
        } catch (error) {
            console.error('Error toggling payment status:', error);
            alert('Erro ao atualizar status de pagamento. Verifique o console para detalhes.');
        }
    };

    return (
        <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-black/40 text-slate-400 uppercase text-sm font-semibold backdrop-blur-sm">
                        <tr>
                            <th className="p-4 w-12"></th>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Plano</th>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Pagamento</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {students.map((student) => {
                            const status = getStudentStatus(student);
                            const isOverdue = status === 'overdue';
                            const isExpanded = expandedId === student.id;

                            return (
                                <Fragment key={student.id}>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleExpand(student.id)}
                                                className="text-slate-400 hover:text-white transition-colors"
                                            >
                                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </button>
                                        </td>
                                        <td className="p-4 font-medium text-white">{student.name}</td>
                                        <td className="p-4 capitalize">{student.planType}</td>
                                        <td className="p-4 capitalize">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${student.athleteType === 'athlete'
                                                ? 'bg-orange-500/10 text-orange-400'
                                                : 'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {student.athleteType}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isOverdue
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                }`}>
                                                {isOverdue ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                                {isOverdue ? 'Pendente' : 'Em dia'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {student.lastPaymentDate && isValid(parseISO(student.lastPaymentDate))
                                                ? format(parseISO(student.lastPaymentDate), "d 'de' MMMM", { locale: ptBR })
                                                : 'N/A'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleTogglePayment(student, isOverdue)}
                                                    className={`p-2 rounded-lg transition-colors ${isOverdue
                                                        ? 'text-red-400 hover:bg-red-500/10'
                                                        : 'text-emerald-400 hover:bg-emerald-500/10'
                                                        }`}
                                                    title={isOverdue ? "Marcar como Pago" : "Marcar como Pendente"}
                                                >
                                                    <DollarSign className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(student)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Tem certeza que deseja remover ${student.name}?`)) {
                                                            deleteStudent(student.id);
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Row */}
                                    {isExpanded && (
                                        <tr className="bg-slate-750">
                                            <td colSpan={7} className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Contact Information */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">Contato</h4>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="w-4 h-4 text-slate-500" />
                                                            <span className="text-slate-400">Usuário:</span>
                                                            <span className="text-white">{student.username}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className="text-slate-400">Email:</span>
                                                            <span className="text-white">{student.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className="text-slate-400">Telefone:</span>
                                                            <span className="text-white">{student.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar className="w-4 h-4 text-slate-500" />
                                                            <span className="text-slate-400">Idade:</span>
                                                            <span className="text-white">{calculateAge(student.birthDate)} anos</span>
                                                            <span className="text-slate-500 text-xs">
                                                                ({student.birthDate && isValid(parseISO(student.birthDate)) ? format(parseISO(student.birthDate), "dd/MM/yyyy") : 'N/A'})
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Physical & Training Info */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">Dados Físicos & Treino</h4>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Ruler className="w-4 h-4 text-slate-500" />
                                                            <span className="text-slate-400">Altura:</span>
                                                            <span className="text-white">{student.height} cm</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Weight className="w-4 h-4 text-slate-500" />
                                                            <span className="text-slate-400">Peso:</span>
                                                            <span className="text-white">{student.weight} kg</span>
                                                        </div>
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <Target className="w-4 h-4 text-slate-500 mt-0.5" />
                                                            <div>
                                                                <span className="text-slate-400">Objetivo:</span>
                                                                <p className="text-white mt-1">{student.objective}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentList;
