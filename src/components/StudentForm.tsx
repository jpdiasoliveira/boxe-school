import { useState, useEffect } from 'react';
import type { Student, PlanType } from '../types';
import { X } from 'lucide-react';

interface StudentFormProps {
    student?: Student;
    onSave: (student: Omit<Student, 'id'>) => void;
    onUpdate: (id: string, student: Partial<Student>) => void;
    onClose: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onUpdate, onClose }) => {
    const [formData, setFormData] = useState<Omit<Student, 'id'>>({
        userId: '',
        username: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        birthDate: '',
        height: 170,
        weight: 70,
        objective: '',
        joinDate: new Date().toISOString().split('T')[0],
        planType: 'monthly',
        athleteType: 'functional',
        paymentDay: 1,
        active: true,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        monthlyFee: 0,
    });

    useEffect(() => {
        if (student) {
            setFormData({
                userId: student.userId || '',
                username: student.username || '',
                name: student.name || '',
                email: student.email || '',
                phone: student.phone || '',
                address: student.address || '',
                birthDate: student.birthDate || '',
                height: student.height || 170,
                weight: student.weight || 70,
                objective: student.objective || '',
                joinDate: student.joinDate || new Date().toISOString().split('T')[0],
                planType: student.planType || 'monthly',
                athleteType: student.athleteType || 'functional',
                paymentDay: student.paymentDay || 1,
                active: student.active ?? true,
                lastPaymentDate: student.lastPaymentDate || new Date().toISOString().split('T')[0],
                monthlyFee: student.monthlyFee || 0,
            });
        }
    }, [student]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (student) {
            // Only update editable fields (not username/password)
            const { username, ...editableFields } = formData;
            onUpdate(student.id, editableFields);
        } else {
            onSave(formData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl my-8">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">
                        {student ? 'Editar Aluno' : 'Novo Aluno (Manual)'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Username (read-only when editing) */}
                    {student && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Nome de Usuário</label>
                            <input
                                type="text"
                                disabled
                                value={formData.username}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">O usuário não pode ser alterado</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Telefone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Endereço</label>
                        <input
                            type="text"
                            value={formData.address || ''}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Rua, Número, Bairro..."
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Data de Nascimento</label>
                            <input
                                type="date"
                                required
                                value={formData.birthDate}
                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Altura (cm)</label>
                            <input
                                type="number"
                                required
                                min="100"
                                max="250"
                                value={formData.height}
                                onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Peso (kg)</label>
                            <input
                                type="number"
                                required
                                min="30"
                                max="200"
                                step="0.1"
                                value={formData.weight}
                                onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Objetivo no Boxe</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.objective}
                            onChange={e => setFormData({ ...formData, objective: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Plano</label>
                            <select
                                value={formData.planType}
                                onChange={e => setFormData({ ...formData, planType: e.target.value as PlanType })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="daily">Diária</option>
                                <option value="monthly">Mensal</option>
                                <option value="semiannual">Semestral</option>
                                <option value="annual">Anual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
                            <select
                                value={formData.athleteType}
                                onChange={e => setFormData({ ...formData, athleteType: e.target.value as any })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="functional">Funcional</option>
                                <option value="athlete">Atleta</option>
                                <option value="private">Particular</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Valor da Mensalidade (R$)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.monthlyFee || ''}
                            onChange={e => setFormData({ ...formData, monthlyFee: parseFloat(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Valor personalizado"
                        />
                        <p className="text-xs text-slate-500 mt-1">Deixe em branco ou 0 para usar o valor padrão do plano.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Dia Vencimento</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={formData.paymentDay}
                                onChange={e => setFormData({ ...formData, paymentDay: parseInt(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Último Pagamento</label>
                            <input
                                type="date"
                                value={formData.lastPaymentDate}
                                onChange={e => setFormData({ ...formData, lastPaymentDate: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
