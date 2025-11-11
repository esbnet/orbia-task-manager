#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {

    // Teste básico de conexão
    await prisma.$connect();

    // Teste de query simples
    const result = await prisma.$queryRaw`SELECT version()`;

    // Verificar se as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;


    console.log('✅ Database connection successful');
    console.log('📊 Database version:', result);
    console.log('📋 Available tables:', tables.map(t => t.table_name).join(', '));

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();