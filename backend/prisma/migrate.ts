import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running database migrations...');
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('Database connected successfully!');
    
    // Create tables if they don't exist
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );`;
    
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");`;
    
    console.log('Database tables created/verified successfully!');
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
