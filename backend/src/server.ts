import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Initialize database
async function initDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Create tables if they don't exist
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS users (
      id TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT users_pkey PRIMARY KEY (id)
    );`;
    
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users(username);`;
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS professors (
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT,
      instagram TEXT,
      facebook TEXT,
      bio TEXT,
      "portfolioUrl" TEXT,
      "userId" TEXT NOT NULL,
      CONSTRAINT professors_pkey PRIMARY KEY (id)
    );`;
    
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS professors_userId_key ON professors("userId");`;
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS students (
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      "birthDate" TEXT NOT NULL,
      weight DOUBLE PRECISION NOT NULL,
      height DOUBLE PRECISION NOT NULL,
      objective TEXT NOT NULL,
      "athleteType" TEXT NOT NULL,
      "planType" TEXT NOT NULL,
      "paymentDay" INTEGER NOT NULL,
      "joinDate" TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true,
      "lastPaymentDate" TEXT,
      "userId" TEXT NOT NULL,
      CONSTRAINT students_pkey PRIMARY KEY (id)
    );`;
    
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS students_userId_key ON students("userId");`;
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS trainingsessions (
      id TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      createdby TEXT NOT NULL,
      CONSTRAINT trainingsessions_pkey PRIMARY KEY (id)
    );`;
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS attendance (
      id TEXT NOT NULL,
      date TEXT NOT NULL,
      present BOOLEAN NOT NULL,
      "studentId" TEXT NOT NULL,
      "trainingSessionId" TEXT,
      CONSTRAINT attendance_pkey PRIMARY KEY (id)
    );`;
    
    console.log('✅ Database tables created/verified successfully');
  } catch (error) {
    console.error('❌ Database error:', error);
    // Continue without database for now
  }
}

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// --- Auth Routes ---

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // Validação de entrada
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Dados inválidos' });
    }

    if (username.length < 3 || password.length < 6) {
        return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    try {
        // Buscar usuário com SQL direto
        const users = await prisma.$queryRaw`
            SELECT id, username, password, role FROM users WHERE username = ${username}
        ` as any[];

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        // Buscar informações adicionais baseado no role
        let additionalInfo = {};
        
        if (user.role === 'professor') {
            const professors = await prisma.$queryRaw`
                SELECT id, name, email FROM professors WHERE userId = ${user.id}
            ` as any[];
            if (professors.length > 0) {
                additionalInfo = { professor: professors[0] };
            }
        } else if (user.role === 'student') {
            const students = await prisma.$queryRaw`
                SELECT id, name, email, userId FROM students WHERE userId = ${user.id}
            ` as any[];
            if (students.length > 0) {
                additionalInfo = { 
                    student: students[0],
                    profileId: students[0].userId.toString() // Adicionar profileId
                };
            }
        }

        // Retornar usuário sem senha
        const { password: _, ...userWithoutPassword } = user;
        res.json({ ...userWithoutPassword, ...additionalInfo });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// Register Student
app.post('/api/auth/register/student', async (req, res) => {
    const { username, password, ...studentData } = req.body;

    // Validação de entrada
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    if (!studentData.name || !studentData.email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    try {
        // Verificar se usuário já existe
        const existingUser = await prisma.$queryRaw`SELECT id FROM users WHERE username = ${username}` as any[];
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Nome de usuário já existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Gerar IDs numéricos
        const userId = Math.floor(Math.random() * 1000000) + 1;
        const studentId = Math.floor(Math.random() * 1000000) + 1;

        // Inserir usuário
        await prisma.$queryRaw`
            INSERT INTO users (id, username, password, role) 
            VALUES (${userId}, ${username}, ${hashedPassword}, 'student')
        `;

        // Inserir aluno
        await prisma.$queryRaw`
            INSERT INTO students (id, name, email, phone, birthdate, weight, height, objective, athletetype, plantype, paymentday, joindate, active, userid) 
            VALUES (${studentId}, ${studentData.name}, ${studentData.email}, ${studentData.phone}, ${studentData.birthDate}, ${studentData.weight}, ${studentData.height}, ${studentData.objective}, ${studentData.athleteType}, ${studentData.planType}, ${studentData.paymentDay}, ${studentData.joinDate || new Date().toISOString().split('T')[0]}, true, ${userId})
        `;

        res.json({ 
            message: 'Aluno cadastrado com sucesso',
            user: { id: userId, username, role: 'student' },
            student: { 
                id: studentId, 
                name: studentData.name, 
                email: studentData.email,
                userId 
            }
        });

    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ error: 'Erro ao registrar aluno' });
    }
});

// Register Professor
app.post('/api/auth/register/professor', async (req, res) => {
    const { username, password, name, email } = req.body;

    // Validação de entrada
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Dados inválidos' });
    }
    try {
        // Validar entrada
        if (!username || !password || !name || !email) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        // Verificar se usuário já existe
        const existingUser = await prisma.$queryRaw`SELECT id FROM users WHERE username = ${username}` as any[];
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Nome de usuário já existe' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Gerar IDs numéricos
        const userId = Math.floor(Math.random() * 1000000) + 1;
        const professorId = Math.floor(Math.random() * 1000000) + 1;

        // Inserir usuário
        await prisma.$queryRaw`
            INSERT INTO users (id, username, password, role) 
            VALUES (${userId}, ${username}, ${hashedPassword}, 'professor')
        `;

        // Inserir professor
        await prisma.$queryRaw`
            INSERT INTO professors (id, name, email, userid) 
            VALUES (${professorId}, ${name}, ${email}, ${userId})
        `;

        res.json({ 
            message: 'Professor cadastrado com sucesso',
            user: { id: userId, username, role: 'professor' },
            professor: { id: professorId, name, email, userId }
        });

    } catch (error) {
        console.error('Error registering professor:', error);
        res.status(500).json({ error: 'Erro ao registrar professor' });
    }
});

// --- Professor Routes ---

// Get All Professors
app.get('/api/professors', async (req, res) => {
    try {
        const professors = await prisma.$queryRaw`SELECT * FROM professors` as any[];
        res.json(professors);
    } catch (error) {
        console.error('Error fetching professors:', error);
        res.status(500).json({ error: 'Erro ao buscar professores' });
    }
});

// Update Professor
app.put('/api/professors/:id', async (req, res) => {
    const { id } = req.params;
    const { whatsapp, instagram, facebook, bio, portfolioUrl } = req.body;

    try {
        const professor = await prisma.professor.update({
            where: { id },
            data: {
                whatsapp,
                instagram,
                facebook,
                bio,
                portfolioUrl
            }
        });
        res.json(professor);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar professor' });
    }
});

// --- Data Routes ---

// Get Students
app.get('/api/students', async (req, res) => {
    try {
        const students = await prisma.$queryRaw`
            SELECT id, name, email, phone, birthDate, weight, height, objective, athleteType, planType, paymentDay, joinDate, active, lastPaymentDate, userId 
            FROM students
        ` as any[];
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});

// Update Student
app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const student = await prisma.student.update({
            where: { id },
            data: req.body
        });
        res.json(student);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar aluno' });
    }
});

// Delete Student
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$executeRawUnsafe(`DELETE FROM students WHERE userid = '${id}'`);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting student:', error);
        res.status(400).json({ error: 'Erro ao deletar aluno' });
    }
});

// Get Upcoming Trainings
app.get('/api/trainings', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const trainings = await prisma.$queryRaw`SELECT * FROM trainingsessions WHERE date >= ${today} ORDER BY date, time` as any[];
        res.json(trainings);
    } catch (error) {
        console.error('Error fetching trainings:', error);
        res.status(500).json({ error: 'Erro ao buscar treinos' });
    }
});

// Create Training
app.post('/api/trainings', async (req, res) => {
    try {
        console.log('Received training data:', req.body);
        const { date, time, location, description, createdby } = req.body;
        
        if (!date || !time || !location || !createdby) {
            return res.status(400).json({ 
                error: 'Campos obrigatórios faltando: date, time, location, createdby',
                received: { date, time, location, createdby }
            });
        }
        
        const trainingId = Math.floor(Math.random() * 1000000) + 1;
        
        // Usar SQL puro para evitar problemas de tipo
        const sql = `
            INSERT INTO trainingsessions (id, date, time, location, description, createdby) 
            VALUES ('${trainingId}', '${date}', '${time}', '${location}', '${description}', '${createdby}')
        `;
        
        await prisma.$executeRawUnsafe(sql);
        
        const training = await prisma.$queryRaw`SELECT * FROM trainingsessions WHERE id = '${trainingId}'` as any[];
        res.json(training[0]);
    } catch (error: any) {
        console.error('Error creating training:', error);
        res.status(400).json({ 
            error: 'Erro ao criar treino',
            details: error.message
        });
    }
});

// Update Training
app.put('/api/trainings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { date, time, location, description } = req.body;
        await prisma.$executeRawUnsafe(`
            UPDATE trainingsessions 
            SET date = '${date}', time = '${time}', location = '${location}', description = '${description}'
            WHERE id = '${id}'
        `);
        
        const training = await prisma.$queryRaw`SELECT * FROM trainingsessions WHERE id = '${id}'` as any[];
        res.json(training[0]);
    } catch (error: any) {
        console.error('Error updating training:', error);
        res.status(400).json({ error: 'Erro ao atualizar treino' });
    }
});

// Delete Training
app.delete('/api/trainings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.$executeRawUnsafe(`DELETE FROM trainingsessions WHERE id = '${id}'`);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting training:', error);
        res.status(400).json({ error: 'Erro ao deletar treino' });
    }
});

// Get Attendance
app.get('/api/attendance', async (req, res) => {
    try {
        const attendance = await prisma.$queryRaw`SELECT * FROM attendance` as any[];
        res.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Erro ao buscar presença' });
    }
});

// Mark Attendance
app.post('/api/attendance', async (req, res) => {
    const { studentId, trainingSessionId, present, date } = req.body;

    try {
        // Check if exists to update, or create new
        // For simplicity, we'll just create or update based on a find
        // Ideally we'd use upsert but we need a unique constraint on studentId + trainingSessionId

        // Let's find existing first
        const existing = await prisma.attendance.findFirst({
            where: {
                studentId,
                trainingSessionId
            }
        });

        if (existing) {
            const updated = await prisma.attendance.update({
                where: { id: existing.id },
                data: { present }
            });
            res.json(updated);
        } else {
            const created = await prisma.attendance.create({
                data: {
                    studentId,
                    trainingSessionId,
                    present,
                    date
                }
            });
            res.json(created);
        }
    } catch (error) {
        res.status(400).json({ error: 'Erro ao marcar presença' });
    }
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initDatabase();
});
