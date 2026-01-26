-- Criar tabelas necessárias para o Boxe School
-- Execute este SQL no Supabase SQL Editor

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Índice único para username
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- Tabela de Professores
CREATE TABLE IF NOT EXISTS "Professor" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "whatsapp" TEXT,
  "instagram" TEXT,
  "facebook" TEXT,
  "bio" TEXT,
  "portfolioUrl" TEXT,
  "userId" TEXT NOT NULL,
  CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- Índice único para userId em Professor
CREATE UNIQUE INDEX IF NOT EXISTS "Professor_userId_key" ON "Professor"("userId");

-- Tabela de Alunos
CREATE TABLE IF NOT EXISTS "Student" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "birthDate" TEXT NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL,
  "height" DOUBLE PRECISION NOT NULL,
  "objective" TEXT NOT NULL,
  "athleteType" TEXT NOT NULL,
  "planType" TEXT NOT NULL,
  "paymentDay" INTEGER NOT NULL,
  "joinDate" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastPaymentDate" TEXT,
  "userId" TEXT NOT NULL,
  CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- Índice único para userId em Student
CREATE UNIQUE INDEX IF NOT EXISTS "Student_userId_key" ON "Student"("userId");

-- Tabela de Treinos
CREATE TABLE IF NOT EXISTS "TrainingSession" (
  "id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "description" TEXT,
  "createdBy" TEXT NOT NULL,
  CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- Tabela de Presença
CREATE TABLE IF NOT EXISTS "Attendance" (
  "id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "present" BOOLEAN NOT NULL,
  "studentId" TEXT NOT NULL,
  "trainingSessionId" TEXT,
  CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS "Attendance_studentId_idx" ON "Attendance"("studentId");
CREATE INDEX IF NOT EXISTS "Attendance_trainingSessionId_idx" ON "Attendance"("trainingSessionId");
CREATE INDEX IF NOT EXISTS "TrainingSession_createdBy_idx" ON "TrainingSession"("createdBy");
