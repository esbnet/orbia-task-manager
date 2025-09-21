#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Atualizando schema do banco de dados...');

try {
  // Navegar para o diretório raiz do projeto
  const projectRoot = path.resolve(__dirname, '..');
  process.chdir(projectRoot);

  console.log('📦 Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🗃️ Aplicando mudanças no banco...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('✅ Schema atualizado com sucesso!');
  console.log('');
  console.log('📋 Mudanças aplicadas:');
  console.log('  - Adicionado campo "status" (padrão: "Em Andamento")');
  console.log('  - Adicionado campo "priority" (padrão: "Média")');
  console.log('  - Adicionado campo "category" (padrão: "Pessoa")');
  console.log('  - Adicionado campo "updatedAt" (auto-atualizado)');
  console.log('');
  console.log('🚀 Agora você pode executar: npm run dev');

} catch (error) {
  console.error('❌ Erro ao atualizar schema:', error.message);
  process.exit(1);
}
