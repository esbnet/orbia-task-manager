#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { InputSanitizer } from '../infra/validation/input-sanitizer.ts';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');

    // Teste básico de conexão
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Teste de query simples
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database version query successful');
    console.log('📊 PostgreSQL version:', result[0]?.version || 'Unknown');

    // Verificar se as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Tables found:', tables.length);
    if (tables.length > 0) {
      console.log('📋 Table names:', tables.map(t => t.table_name).join(', '));
    } else {
      console.warn('⚠️  No tables found in public schema');
    }

    console.log('✅ All database tests passed successfully');
  } catch (error) {
    const safeMessage = InputSanitizer.sanitizeForLog(error?.message || 'Unknown error');
    console.error('❌ Database connection failed:', safeMessage);
    if (process.env.NODE_ENV === 'development' && error?.stack) {
      console.error('Stack trace:', InputSanitizer.sanitizeForLog(error.stack));
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();