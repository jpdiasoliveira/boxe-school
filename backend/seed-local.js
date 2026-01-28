const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seed() {
  try {
    // Criar usuário professor primeiro
    const professorPassword = await bcrypt.hash('123456', 10);
    const professorUser = await prisma.user.create({
      data: {
        username: 'professor2025',
        password: professorPassword,
        role: 'professor'
      }
    });

    // Criar professor relacionado
    const professor = await prisma.professor.create({
      data: {
        userId: professorUser.id,
        name: 'Professor Teste',
        email: 'professor@teste.com'
      }
    });

    // Criar usuário aluno primeiro
    const studentPassword = await bcrypt.hash('123456', 10);
    const studentUser = await prisma.user.create({
      data: {
        username: 'testenovo2025',
        password: studentPassword,
        role: 'student'
      }
    });

    // Criar aluno relacionado
    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        name: 'Teste Novo',
        email: 'testenovo@teste.com',
        phone: '11999999999',
        birthDate: '2000-01-01',
        height: 175,
        weight: 70,
        objective: 'perder peso',
        athleteType: 'amador',
        planType: 'mensal',
        paymentDay: 10,
        joinDate: '2025-01-27',
        active: true
      }
    });

    console.log('✅ Dados criados com sucesso!');
    console.log('👨‍🏫 Professor:', professorUser.username);
    console.log('👨‍🎓 Aluno:', studentUser.username);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
