#!/usr/bin/env node

/**
 * Script para encontrar strings hardcoded em português que precisam ser traduzidas
 * 
 * Uso: node scripts/find-hardcoded-strings.js
 */

const fs = require('fs');
const path = require('path');

// Padrões para encontrar strings em português
const patterns = [
  // Strings entre aspas que contêm caracteres portugueses ou palavras comuns
  /"[^"]*[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ][^"]*"/g,
  /'[^']*[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ][^']*'/g,
  // Palavras comuns em português
  /"[^"]*(?:Salvar|Cancelar|Editar|Excluir|Criar|Novo|Nova|Título|Observação|Dificuldade|Fácil|Difícil|Média|Trivial|Diária|Hábito|Tarefa|Meta|Configurações|Idioma|Tema|Notificações)[^"]*"/gi,
  /'[^']*(?:Salvar|Cancelar|Editar|Excluir|Criar|Novo|Nova|Título|Observação|Dificuldade|Fácil|Difícil|Média|Trivial|Diária|Hábito|Tarefa|Meta|Configurações|Idioma|Tema|Notificações)[^']*'/gi,
];

// Extensões de arquivo para verificar
const extensions = ['.tsx', '.ts', '.jsx', '.js'];

// Diretórios para ignorar
const ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build'];

function shouldIgnoreFile(filePath) {
  return ignoreDirs.some(dir => filePath.includes(dir)) ||
         filePath.includes('i18n') || // Ignorar arquivos de i18n
         filePath.includes('example') || // Ignorar exemplos
         filePath.includes('.test.') || // Ignorar testes
         filePath.includes('.spec.'); // Ignorar specs
}

function findStringsInFile(filePath) {
  if (!extensions.some(ext => filePath.endsWith(ext)) || shouldIgnoreFile(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const line = content.substring(0, match.index).split('\n').length;
        const string = match[0];
        
        // Filtrar strings que provavelmente não precisam de tradução
        if (shouldIgnoreString(string)) {
          continue;
        }

        results.push({
          file: filePath,
          line,
          string,
          context: getContext(content, match.index)
        });
      }
    });

    return results;
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error.message);
    return [];
  }
}

function shouldIgnoreString(string) {
  const ignored = [
    // URLs e paths
    /^["']https?:\/\//,
    /^["']\/[^"']*["']$/,
    /^["']\.[^"']*["']$/,
    // Classes CSS
    /^["'][^"']*(?:className|class)[^"']*["']$/,
    // IDs e keys técnicos
    /^["'][a-z0-9-_]+["']$/i,
    // Códigos de idioma
    /^["'](?:pt-BR|en-US|es-ES)["']$/,
    // Valores técnicos
    /^["'](?:light|dark|system|true|false|null|undefined)["']$/,
    // Formatos de data
    /^["']PPP["']$/,
    // Strings muito curtas (1-2 caracteres)
    /^["'].{1,2}["']$/,
  ];

  return ignored.some(pattern => pattern.test(string));
}

function getContext(content, index) {
  const lines = content.substring(0, index).split('\n');
  const currentLine = lines[lines.length - 1];
  const nextLines = content.substring(index).split('\n').slice(0, 2);
  
  return {
    before: currentLine,
    after: nextLines[1] || ''
  };
}

function scanDirectory(dir) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !ignoreDirs.includes(item)) {
        results.push(...scanDirectory(fullPath));
      } else if (stat.isFile()) {
        results.push(...findStringsInFile(fullPath));
      }
    }
  } catch (error) {
    console.error(`Erro ao escanear diretório ${dir}:`, error.message);
  }
  
  return results;
}

function main() {
  console.log('🔍 Procurando strings hardcoded em português...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const results = scanDirectory(srcDir);
  
  if (results.length === 0) {
    console.log('✅ Nenhuma string hardcoded encontrada!');
    return;
  }
  
  console.log(`📝 Encontradas ${results.length} strings que podem precisar de tradução:\n`);
  
  // Agrupar por arquivo
  const byFile = results.reduce((acc, result) => {
    if (!acc[result.file]) {
      acc[result.file] = [];
    }
    acc[result.file].push(result);
    return acc;
  }, {});
  
  Object.entries(byFile).forEach(([file, strings]) => {
    console.log(`📄 ${file.replace(process.cwd(), '.')}`);
    strings.forEach(({ line, string, context }) => {
      console.log(`   Linha ${line}: ${string}`);
      if (context.before.trim()) {
        console.log(`   Contexto: ${context.before.trim()}`);
      }
    });
    console.log('');
  });
  
  console.log(`\n💡 Dicas:`);
  console.log(`   • Use t("categoria.chave") para traduzir strings`);
  console.log(`   • Adicione novas chaves em src/i18n/shared.ts`);
  console.log(`   • Veja src/i18n/README.md para mais informações`);
}

if (require.main === module) {
  main();
}