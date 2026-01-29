import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseISO, isAfter, isValid, addMonths } from 'date-fns';
import type { Student, Attendance, Professor, TrainingSession, PricingConfig } from '../types';

const API_URL =
    (import.meta as any).env?.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001/api'
        : 'https://backend-kappa-two-37.vercel.app/api');

const DEFAULT_PRICING: PricingConfig = {
    monthly: { athlete: 120, functional: 100, private: 200 },
    semiannual: { athlete: 100, functional: 90, private: 180 },
    annual: { athlete: 90, functional: 80, private: 160 },
    daily: { athlete: 20, functional: 20, private: 50 }
};

interface BoxingContextType {
    students: Student[];
    professors: Professor[];
    attendance: Attendance[];
    trainingSessions: TrainingSession[];
    pricingConfig: PricingConfig;
    updatePricingConfig: (config: PricingConfig) => void;
    addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
    updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
    markAttendance: (studentId: string, present: boolean, trainingSessionId?: string) => Promise<void>;
    getStudentStatus: (student: Student) => 'active' | 'overdue';
    currentUser: { role: 'professor' | 'student'; id: string; username: string; profileId?: string } | null;
    login: (username: string, password: string) => Promise<{ role: string } | null>;
    logout: () => void;
    registerStudent: (studentData: Omit<Student, 'id' | 'active' | 'joinDate' | 'userId' | 'username'>, password: string, username: string) => Promise<boolean>;
    registerProfessor: (professorData: Omit<Professor, 'id' | 'userId'>, password: string, username: string) => Promise<boolean>;
    addTrainingSession: (training: Omit<TrainingSession, 'id'>) => Promise<void>;
    deleteTrainingSession: (id: string) => Promise<void>;
    updateTrainingSession: (id: string, updates: Partial<TrainingSession>) => Promise<void>;
    getUpcomingTrainings: () => TrainingSession[];
    canConfirmAttendance: (trainingDate: string, trainingTime: string) => boolean;
    updateProfessor: (id: string, data: Partial<Professor>) => Promise<void>;
    loading: boolean;
}

const BoxingContext = createContext<BoxingContextType | undefined>(undefined);

export const BoxingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<{ role: 'professor' | 'student'; id: string; username: string; profileId?: string } | null>(() => {
        try {
            const saved = localStorage.getItem('boxing_user');
            console.log('Loading from localStorage:', saved);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Error parsing user from localStorage', e);
            return null;
        }
    });

    const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => {
        try {
            const saved = localStorage.getItem('boxing_pricing');
            return saved ? JSON.parse(saved) : DEFAULT_PRICING;
        } catch (e) {
            return DEFAULT_PRICING;
        }
    });

    const updatePricingConfig = (config: PricingConfig) => {
        setPricingConfig(config);
        localStorage.setItem('boxing_pricing', JSON.stringify(config));
    };

    // Helper for fetch calls
    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { response: { data: errorData } };
        }
        return response.json();
    };

    // Fetch initial data
    useEffect(() => {
        const loadData = async () => {
            if (!currentUser) {
                setStudents([]);
                setAttendance([]);
                setTrainingSessions([]);
                localStorage.removeItem('boxing_user');
                setLoading(false);
                return;
            }

            setLoading(true);

            localStorage.setItem('boxing_user', JSON.stringify(currentUser));

            try {
                const trainings = await apiCall('/trainings');
                setTrainingSessions(trainings);

                // Só buscar professores se for professor
                if (currentUser.role === 'professor') {
                    const professorsData = await apiCall('/professors');
                    setProfessors(professorsData);
                    
                    const [studentsData, attendanceData] = await Promise.all([
                        apiCall('/students'),
                        apiCall('/attendance')
                    ]);
                    setStudents(studentsData);
                    setAttendance(attendanceData);
                } else {
                    // Para alunos, não buscar professores
                    setProfessors([]);
                    const attendanceData = await apiCall('/attendance');
                    setAttendance(attendanceData);
                    const studentsData = await apiCall('/students');
                    const student = studentsData.find((s: any) =>
                        s.userid === currentUser?.profileId ||
                        s.id === currentUser?.profileId ||
                        s.userid === currentUser?.id ||
                        s.id === currentUser?.id
                    );
                    setStudents(student ? [student] : []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentUser]);

    const registerStudent = async (studentData: Omit<Student, 'id' | 'active' | 'joinDate' | 'userId' | 'username'>, password: string, username: string): Promise<boolean> => {
        try {
            const data = await apiCall('/auth/register/student', {
                method: 'POST',
                body: JSON.stringify({
                    ...studentData,
                    username,
                    joinDate: new Date().toISOString().split('T')[0],
                    password
                })
            });

            if (data) {
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Register error:', error);
            const message = error.response?.data?.error || 'Erro ao realizar cadastro';
            const details = error.response?.data?.details || '';
            alert(`${message}${details ? `: ${details}` : ''}`);
            return false;
        }
    };

    const registerProfessor = async (professorData: Omit<Professor, 'id' | 'userId'>, password: string, username: string): Promise<boolean> => {
        try {
            const data = await apiCall('/auth/register/professor', {
                method: 'POST',
                body: JSON.stringify({
                    ...professorData,
                    username,
                    password
                })
            });
            return !!data;
        } catch (error: any) {
            console.error('Register professor error:', error);
            const message = error.response?.data?.error || 'Erro ao realizar cadastro';
            const details = error.response?.data?.details || '';
            throw new Error(`${message}${details ? `: ${details}` : ''}`);
        }
    };

    const login = async (username: string, password: string): Promise<{ role: string } | null> => {
        try {
            const user = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (user) {
                setCurrentUser({
                    id: user.id,
                    username: user.username,
                    role: user.role as 'professor' | 'student',
                    profileId: user.student?.id || user.professor?.id
                });
                return { role: user.role };
            }
            return null;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    };

    const addStudent = async (_student: Omit<Student, 'id'>) => {
        console.warn('Use registerStudent instead');
    };

    const updateStudent = async (id: string, updates: Partial<Student>) => {
        try {
            const data = await apiCall(`/students/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            setStudents(students.map(s => (s.id === id ? data : s)));
        } catch (error) {
            console.error('Error updating student:', error);
            // Optimistic update for now if API fails but we want to show change
            setStudents(students.map(s => (s.id === id ? { ...s, ...updates } : s)));
        }
    };

    const deleteStudent = async (id: string) => {
        try {
            await apiCall(`/students/${id}`, { method: 'DELETE' });
            setStudents(students.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    const markAttendance = async (studentId: string, present: boolean, trainingSessionId?: string) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            await apiCall('/attendance', {
                method: 'POST',
                body: JSON.stringify({
                    studentId,
                    trainingSessionId,
                    present,
                    date: today
                })
            });

            const attendanceData = await apiCall('/attendance');
            setAttendance(attendanceData);
        } catch (error) {
            console.error('Mark attendance error:', error);
        }
    };

    const getStudentStatus = (student: Student | undefined): 'active' | 'overdue' => {
        if (!student || !student.lastPaymentDate) return 'active';

        try {
            const nextPayment = addMonths(parseISO(student.lastPaymentDate), 1);
            return isAfter(new Date(), nextPayment) ? 'overdue' : 'active';
        } catch (error) {
            console.error('Error parsing payment date for student:', student.id, error);
            return 'active';
        }
    };

    const addTrainingSession = async (training: Omit<TrainingSession, 'id'>) => {
        try {
            // Verificar se o usuário atual é professor
            if (!currentUser || currentUser.role !== 'professor') {
                throw new Error('Apenas professores podem criar treinos');
            }
            
            await apiCall('/trainings', {
                method: 'POST',
                body: JSON.stringify(training)
            });
            const trainings = await apiCall('/trainings');
            setTrainingSessions(trainings);
        } catch (error) {
            console.error('Add training error:', error);
            throw error;
        }
    };

    const deleteTrainingSession = async (id: string) => {
        try {
            // Verificar se o usuário atual é professor
            if (!currentUser || currentUser.role !== 'professor') {
                throw new Error('Apenas professores podem deletar treinos');
            }
            
            await apiCall(`/trainings/${id}`, { method: 'DELETE' });
            const trainings = await apiCall('/trainings');
            setTrainingSessions(trainings);
        } catch (error) {
            console.error('Delete training error:', error);
            throw error;
        }
    };

    const updateTrainingSession = async (id: string, updates: Partial<TrainingSession>) => {
        try {
            const data = await apiCall(`/trainings/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            setTrainingSessions(trainingSessions.map(t => (t.id === id ? data : t)));
        } catch (error) {
            console.error('Error updating training session:', error);
            setTrainingSessions(trainingSessions.map(t => (t.id === id ? { ...t, ...updates } : t)));
        }
    };

    const getUpcomingTrainings = (): TrainingSession[] => {
        const today = new Date().toISOString().split('T')[0];
        return trainingSessions
            .filter(t => t.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date));
    };

    const canConfirmAttendance = (trainingDate: string, trainingTime: string): boolean => {
        try {
            const today = new Date();
            // Combine date and time
            const trainingDateTime = parseISO(`${trainingDate}T${trainingTime}`);

            if (!isValid(trainingDateTime)) return false;

            const diffInMs = trainingDateTime.getTime() - today.getTime();
            const diffInHours = diffInMs / (1000 * 60 * 60);
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

            // Can confirm up to 3 days before AND at least 1 hour before
            return diffInDays <= 3 && diffInHours >= 1;
        } catch (error) {
            return false;
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('boxing_user');
    };

    const updateProfessor = async (id: string, data: Partial<Professor>) => {
        try {
            const responseData = await apiCall(`/professors/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            setProfessors(prev => prev.map(p => p.id === id ? responseData : p));
        } catch (error) {
            console.error('Error updating professor:', error);
            throw error;
        }
    };

    return (
        <BoxingContext.Provider
            value={{
                students,
                professors,
                attendance,
                trainingSessions,
                addStudent,
                updateStudent,
                deleteStudent,
                markAttendance,
                getStudentStatus,
                currentUser,
                login,
                logout,
                registerStudent,
                registerProfessor,
                addTrainingSession,
                deleteTrainingSession,
                updateTrainingSession,
                getUpcomingTrainings,
                canConfirmAttendance,
                updateProfessor,
                loading,
                pricingConfig,
                updatePricingConfig,
            }}
        >
            {children}
        </BoxingContext.Provider>
    );
};

export const useBoxing = () => {
    const context = useContext(BoxingContext);
    if (context === undefined) {
        throw new Error('useBoxing must be used within a BoxingProvider');
    }
    return context;
};
