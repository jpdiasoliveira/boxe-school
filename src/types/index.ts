
export type PlanType = 'daily' | 'monthly' | 'semiannual' | 'annual';

export type StudentStatus = 'active' | 'inactive' | 'overdue';

export type UserRole = 'professor' | 'student';

export interface User {
    id: string;
    username: string;
    password: string;
    role: UserRole;
    associatedId: string; // ID of the professor or student record
}

export interface Payment {
    id: string;
    studentId: string;
    date: string;
    amount: number;
    type: PlanType;
    status: 'paid' | 'pending' | 'overdue';
}

export interface Attendance {
    id: string;
    studentId: string;
    date: string;
    present: boolean;
    trainingSessionId?: string; // Optional reference to specific training session
}

export interface TrainingSession {
    id: string;
    date: string; // ISO date (YYYY-MM-DD)
    time: string; // e.g., "19:00"
    location: string;
    description?: string;
    createdby: string; // professor ID
}

export interface Student {
    id: string;
    userId: string;
    username: string;
    name: string;
    email: string;
    phone: string;
    birthDate: string; // Date of birth
    height: number; // in cm
    weight: number; // in kg
    objective: string; // Objetivo do treino
    joinDate: string;
    planType: PlanType;
    athleteType: 'athlete' | 'functional' | 'private';
    paymentDay: number; // Day of the month
    active: boolean;
    lastPaymentDate?: string;
    monthlyFee?: number; // Custom monthly fee for the student
    address?: string;
}

export interface Professor {
    id: string;
    name: string;
    email: string;
    userId: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    bio?: string;
    portfolioUrl?: string;
}
export interface PricingConfig {
    monthly: { athlete: number; functional: number; private: number };
    semiannual: { athlete: number; functional: number; private: number };
    annual: { athlete: number; functional: number; private: number };
    daily: { athlete: number; functional: number; private: number };
}
