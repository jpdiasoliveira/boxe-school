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
    console.log('🔄 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    console.log('🔄 Creating users table...');
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS users (
      id TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT users_pkey PRIMARY KEY (id)
    );`;
    console.log('✅ Users table created/verified');
    
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users(username);`;
    
    console.log('🔄 Creating professors table...');
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS professors (
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT,
      instagram TEXT,
      facebook TEXT,
      bio TEXT,
      "portfolioUrl" TEXT,
      "userid" TEXT NOT NULL,
      CONSTRAINT professors_pkey PRIMARY KEY (id)
    );`;
    console.log('✅ Professors table created/verified');
    
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS professors_userid_key ON professors("userid");`;
    
    console.log('🔄 Creating students table...');
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
      "userid" TEXT NOT NULL,
      CONSTRAINT students_pkey PRIMARY KEY (id)
    );`;
    console.log('✅ Students table created/verified');
    
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS students_userid_key ON students("userid");`;
    
    console.log('🔄 Creating trainingsessions table...');
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS trainingsessions (
      id TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      createdby TEXT NOT NULL,
      CONSTRAINT trainingsessions_pkey PRIMARY KEY (id)
    );`;
    console.log('✅ Training sessions table created/verified');
    
    console.log('🔄 Creating attendance table...');
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS attendance (
      id TEXT NOT NULL,
      date TEXT NOT NULL,
      present BOOLEAN NOT NULL,
      "studentId" TEXT NOT NULL,
      "trainingSessionId" TEXT,
      CONSTRAINT attendance_pkey PRIMARY KEY (id)
    );`;
    console.log('✅ Attendance table created/verified');
    
    console.log('✅ All database tables created/verified successfully');
  } catch (error) {
    console.error('❌ Database error:', error);
    throw error; // Re-throw to see the error in logs
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
                SELECT id, name, email FROM professors WHERE "userid" = ${user.id}
            ` as any[];
            if (professors.length > 0) {
                additionalInfo = { professor: professors[0] };
            }
        } else if (user.role === 'student') {
            const students = await prisma.$queryRaw`
                SELECT id, name, email, "userid" FROM students WHERE "userid" = ${user.id}
            ` as any[];
            if (students.length > 0) {
                additionalInfo = { 
                    student: students[0],
                    profileId: students[0].userid.toString() // Adicionar profileId
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
            INSERT INTO students (id, name, email, phone, "birthDate", weight, height, objective, "athleteType", "planType", "paymentDay", "joinDate", active, "userid") 
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
            INSERT INTO professors (id, name, email, "userid") 
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

// Check Table Structure
app.get('/api/check-tables', async (req, res) => {
    try {
        console.log('🔄 Checking table structure...');
        
        // Verificar estrutura da tabela students
        const studentsStructure = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'students' 
            ORDER BY ordinal_position
        ` as any[];
        
        // Verificar se tabela existe
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ` as any[];
        
        console.log('✅ Tables:', tables);
        console.log('✅ Students structure:', studentsStructure);
        
        res.json({ 
            tables,
            studentsStructure
        });
    } catch (error: any) {
        console.error('❌ Error checking tables:', error);
        res.status(500).json({ error: 'Error checking tables', details: error.message });
    }
});

// Get Students
app.get('/api/students', async (req, res) => {
    try {
        console.log('🔄 Fetching students...');
        const students = await prisma.$queryRaw`
            SELECT id, name, email, phone, birthdate, weight, height, objective, athletetype, plantype, paymentday, joindate, active, lastpaymentdate, userld 
            FROM students
        ` as any[];
        console.log('✅ Students fetched successfully:', students.length, 'students found');
        
        // Mapear para os nomes esperados pelo frontend
        const mappedStudents = students.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            birthDate: student.birthdate,
            weight: student.weight,
            height: student.height,
            objective: student.objective,
            athleteType: student.athletetype,
            planType: student.plantype,
            paymentDay: student.paymentday,
            joinDate: student.joindate,
            active: student.active,
            lastPaymentDate: student.lastpaymentdate,
            userid: student.userld
        }));
        
        res.json(mappedStudents);
    } catch (error: any) {
        console.error('❌ Error fetching students:', error);
        console.error('❌ Full error details:', JSON.stringify(error, null, 2));
        res.status(500).json({ error: 'Erro ao buscar alunos', details: error.message });
    }
});

// Update Student
app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { name, email, phone, birthDate, weight, height, objective, athleteType, planType, paymentDay, active, lastPaymentDate } = req.body;
        
        await prisma.$executeRawUnsafe(`
            UPDATE students 
            SET name = '${name}', email = '${email}', phone = '${phone}', "birthDate" = '${birthDate}', 
                weight = ${weight}, height = ${height}, objective = '${objective}', 
                "athleteType" = '${athleteType}', "planType" = '${planType}', 
                "paymentDay" = ${paymentDay}, active = ${active}, "lastPaymentDate" = '${lastPaymentDate}'
            WHERE "userid" = '${id}'
        `);
        
        // Buscar o aluno atualizado
        const updatedStudent = await prisma.$queryRaw`
            SELECT id, name, email, phone, "birthDate", weight, height, objective, "athleteType", "planType", "paymentDay", "joinDate", active, "lastPaymentDate", "userid" 
            FROM students WHERE "userid" = ${id}
        ` as any[];
        
        res.json(updatedStudent[0]);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(400).json({ error: 'Erro ao atualizar aluno' });
    }
});

// Delete Student
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$executeRawUnsafe(`DELETE FROM students WHERE "userid" = '${id}'`);
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
        console.log('Received attendance data:', { studentId, trainingSessionId, present, date });

        // Check if exists to update, or create new
        const existing = await prisma.$queryRaw`
            SELECT * FROM "attendance" WHERE "studentId" = '${studentId}' AND "trainingSessionId" = '${trainingSessionId}'
        ` as any[];

        if (existing.length > 0) {
            // Update existing
            await prisma.$executeRawUnsafe(`
                UPDATE "attendance" 
                SET present = ${present}, date = '${date}'
                WHERE "studentId" = '${studentId}' AND "trainingSessionId" = '${trainingSessionId}'
            `);
            console.log('Attendance updated successfully');
            res.json({ success: true, updated: true });
        } else {
            // Create new
            const attendanceId = Math.floor(Math.random() * 1000000) + 1;
            await prisma.$executeRawUnsafe(`
                INSERT INTO "attendance" (id, "studentId", "trainingSessionId", present, date)
                VALUES ('${attendanceId}', '${studentId}', '${trainingSessionId}', ${present}, '${date}')
            `);
            console.log('Attendance created successfully');
            res.json({ success: true, created: true });
        }
    } catch (error: any) {
        console.error('Error marking attendance:', error);
        res.status(400).json({ error: 'Erro ao marcar presença', details: error.message });
    }
});

// Create Test Users
app.post('/api/create-test-users', async (req, res) => {
    try {
        console.log('🔄 Creating test users...');
        
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        // Professor
        const professorUserId = 'prof-user-001';
        const professorId = 'prof-001';
        
        // Aluno  
        const studentUserId = 'student-user-001';
        const studentId = 'student-001';
        
        // Verificar se já existem
        const existingProfessor = await prisma.$queryRaw`
            SELECT id FROM users WHERE username = 'professor2025'
        ` as any[];
        
        const existingStudent = await prisma.$queryRaw`
            SELECT id FROM users WHERE username = 'testenovo2025'
        ` as any[];
        
        if (existingProfessor.length === 0) {
            // Criar professor
            await prisma.$queryRaw`
                INSERT INTO users (id, username, password, role) 
                VALUES (${professorUserId}, 'professor2025', ${hashedPassword}, 'professor')
            `;
            
            await prisma.$queryRaw`
                INSERT INTO professors (id, name, email, "userid") 
                VALUES (${professorId}, 'Professor Padrão', 'professor@boxe-school.com', ${professorUserId})
            `;
            
            console.log('✅ Professor user created');
        }
        
        if (existingStudent.length === 0) {
            // Criar aluno
            await prisma.$queryRaw`
                INSERT INTO users (id, username, password, role) 
                VALUES (${studentUserId}, 'testenovo2025', ${hashedPassword}, 'student')
            `;
            
            await prisma.$queryRaw`
                INSERT INTO students (id, name, email, phone, "birthDate", weight, height, objective, "athleteType", "planType", "paymentDay", "joinDate", active, "userid") 
                VALUES (${studentId}, 'Aluno Teste', 'aluno@boxe-school.com', '11987654321', '2000-01-01', 70.5, 175.0, 'Perder peso', 'functional', 'monthly', 10, '2026-01-29', true, ${studentUserId})
            `;
            
            console.log('✅ Student user created');
        }
        
        // Criar treino de exemplo
        const existingTraining = await prisma.$queryRaw`
            SELECT id FROM trainingsessions LIMIT 1
        ` as any[];
        
        if (existingTraining.length === 0) {
            await prisma.$queryRaw`
                INSERT INTO trainingsessions (id, date, time, location, description, createdby)
                VALUES ('training-001', '2026-01-30', '19:00', 'Boxe School - Sala Principal', 'Treino de Muay Thai', ${professorId})
            `;
            
            console.log('✅ Training session created');
        }
        
        console.log('✅ Test users created successfully');
        res.json({ 
            success: true, 
            message: 'Test users created successfully',
            users: {
                professor: { username: 'professor2025', password: '123456' },
                student: { username: 'testenovo2025', password: '123456' }
            }
        });
    } catch (error: any) {
        console.error('❌ Error creating test users:', error);
        res.status(500).json({ error: 'Error creating test users', details: error.message });
    }
});

// Initialize Database Manually
app.post('/api/init-db', async (req, res) => {
    try {
        console.log('🔄 Manual database initialization started...');
        await initDatabase();
        console.log('✅ Manual database initialization completed');
        res.json({ success: true, message: 'Database initialized successfully' });
    } catch (error: any) {
        console.error('❌ Manual database initialization failed:', error);
        res.status(500).json({ error: 'Database initialization failed', details: error.message });
    }
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await initDatabase();
        console.log('✅ Auto database initialization completed');
    } catch (error) {
        console.error('❌ Auto database initialization failed:', error);
    }
});
