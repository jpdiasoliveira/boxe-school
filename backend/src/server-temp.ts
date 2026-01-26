import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3001;

// Mock database storage (temporarily)
const users: any[] = [];
const professors: any[] = [];
const students: any[] = [];

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running without database' });
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

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
        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// Register Student
app.post('/api/auth/register/student', async (req, res) => {
    const { username, password, ...studentData } = req.body;

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
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            return res.status(400).json({ error: 'Nome de usuário já existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            role: 'student'
        };

        const student = {
            id: Date.now().toString(),
            ...studentData,
            joinDate: studentData.joinDate || new Date().toISOString().split('T')[0],
            userId: user.id
        };

        users.push(user);
        students.push(student);

        res.json({ user, student });
    } catch (error: any) {
        res.status(500).json({ 
            error: 'Erro ao registrar aluno',
            details: error.message
        });
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

    if (username.length < 3) {
        return res.status(400).json({ error: 'Nome de usuário deve ter no mínimo 3 caracteres' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    if (!name || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    try {
        // Verificar se usuário já existe
        const existingUser = users.find(u => u.username === username);

        if (existingUser) {
            return res.status(400).json({ error: 'Nome de usuário já existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            role: 'professor'
        };

        const professor = {
            id: Date.now().toString(),
            name,
            email,
            userId: user.id
        };

        users.push(user);
        professors.push(professor);

        res.json({ user, professor });
    } catch (error: any) {
        console.error('Error registering professor:', error);
        res.status(500).json({ error: 'Erro ao registrar professor' });
    }
});

// Get All Professors
app.get('/api/professors', async (req, res) => {
    try {
        res.json(professors);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar professores' });
    }
});

// Mock other endpoints
app.get('/api/students', (req, res) => res.json([]));
app.get('/api/attendance', (req, res) => res.json([]));
app.get('/api/trainings', (req, res) => res.json([]));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
