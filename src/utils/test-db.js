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


    for (const table of tables) {
    }

  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();