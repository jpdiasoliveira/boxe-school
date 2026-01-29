-- PASSO A PASSO: Recriar tabelas do Boxe School no PostgreSQL (Vercel)
-- Execute estes comandos SQL no painel da Vercel: Storage > Databases > seu_database > Query

-- 1. Remover tabelas existentes (se houver)
DROP TABLE IF EXISTS "Attendance" CASCADE;
DROP TABLE IF EXISTS "TrainingSession" CASCADE;
DROP TABLE IF EXISTS "Student" CASCADE;
DROP TABLE IF EXISTS "Professor" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. Recriar tabela User (usuários de login)
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- 3. Recriar tabela Professor
CREATE TABLE "Professor" (
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

CREATE UNIQUE INDEX "Professor_userId_key" ON "Professor"("userId");

-- 4. Recriar tabela Student
CREATE TABLE "Student" (
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
  "address" TEXT,
  "monthlyFee" DOUBLE PRECISION,
  "userid" TEXT NOT NULL,
  CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");
CREATE UNIQUE INDEX "Student_userid_key" ON "Student"("userid");

-- 5. Recriar tabela TrainingSession (treinos)
CREATE TABLE "TrainingSession" (
  "id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "description" TEXT,
  "createdby" TEXT NOT NULL,
  CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- 6. Recriar tabela Attendance (presença)
CREATE TABLE "Attendance" (
  "id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "present" BOOLEAN NOT NULL,
  "studentId" TEXT NOT NULL,
  "trainingSessionId" TEXT,
  CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- 7. Criar índices para performance
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");
CREATE INDEX "Attendance_trainingSessionId_idx" ON "Attendance"("trainingSessionId");
CREATE INDEX "TrainingSession_createdBy_idx" ON "TrainingSession"("createdby");

-- 8. Inserir usuário professor padrão (senha: 123456)
INSERT INTO "User" ("id", "username", "password", "role") 
VALUES ('prof-user-001', 'professor2025', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'professor');

-- 9. Inserir professor padrão
INSERT INTO "Professor" ("id", "name", "email", "userId") 
VALUES ('prof-001', 'Professor Padrão', 'professor@boxe-school.com', 'prof-user-001');

-- 10. Inserir usuário aluno padrão (senha: 123456)
INSERT INTO "User" ("id", "username", "password", "role") 
VALUES ('student-user-001', 'testenovo2025', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'student');

-- 11. Inserir aluno padrão
INSERT INTO "Student" (
  "id", "name", "email", "phone", "birthDate", "weight", "height", 
  "objective", "athleteType", "planType", "paymentDay", "joinDate", 
  "active", "userid", "userId"
) VALUES (
  'student-001', 
  'Aluno Teste', 
  'aluno@boxe-school.com', 
  '11987654321', 
  '2000-01-01', 
  70.5, 
  175.0, 
  'Perder peso', 
  'functional', 
  'monthly', 
  10, 
  '2026-01-28', 
  true, 
  'student-user-001',
  'student-user-001'
);

-- 12. Inserir treino de exemplo
INSERT INTO "TrainingSession" ("id", "date", "time", "location", "description", "createdby")
VALUES ('training-001', '2026-01-30', '19:00', 'Boxe School - Sala Principal', 'Treino de Muay Thai', 'prof-001');

-- FIM DO SCRIPT
-- Agora teste login com:
-- Professor: professor2025 / 123456
-- Aluno: testenovo2025 / 123456
