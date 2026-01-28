const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Get database info
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('📊 Database Connection Test:', result[0]);
    
    // Check user count
    try {
      const users = await prisma.$queryRaw`SELECT count(*) as count FROM users`;
      console.log('� Users Count:', users[0].count);
    } catch (e) {
      console.log('� Users table not accessible');
    }
    
    // Check trainings count
    try {
      const trainings = await prisma.$queryRaw`SELECT count(*) as count FROM trainingsessions`;
      console.log('🥊 Trainings Count:', trainings[0].count);
    } catch (e) {
      console.log('📋 Trainings table not accessible');
    }
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
