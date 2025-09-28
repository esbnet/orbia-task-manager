#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from 'fs';

import { execSync } from 'child_process';
import { join } from 'path';

console.log('🔍 Analisando bundle da aplicação...\n');

// Build da aplicação
try {
  console.log('📦 Fazendo build...');
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}

// Análise do .next/static
const staticDir = join(process.cwd(), '.next/static');
if (existsSync(staticDir)) {
  const chunks = readdirSync(join(staticDir, 'chunks'));
  const pages = readdirSync(join(staticDir, 'chunks/pages'));
  
  console.log('\n📊 Análise do Bundle:');
  console.log(`- Chunks: ${chunks.length}`);
  console.log(`- Pages: ${pages.length}`);
  
  // Tamanho dos maiores chunks
  const chunkSizes = chunks
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = join(staticDir, 'chunks', file);
      const stats = statSync(filePath);
      return { file, size: stats.size };
    })
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);
    
  console.log('\n🔝 Top 5 maiores chunks:');
  chunkSizes.forEach(({ file, size }) => {
    console.log(`- ${file}: ${(size / 1024).toFixed(2)} KB`);
  });
}

console.log('\n✅ Análise concluída!');