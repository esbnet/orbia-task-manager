/**
 * Script de teste para validar a integração entre todos, logs e contagens
 *
 * Para executar:
 * node scripts/test-todo-logs-integration.js
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testTodoLogsIntegration() {
  console.log('🧪 Iniciando teste de integração Todo Logs...\n');

  try {
    // 1. Verificar estrutura das tabelas
    console.log('1️⃣ Verificando estrutura das tabelas...');

    const todosCount = await prisma.todo.count();
    const logsCount = await prisma.todoLog.count();

    console.log(`✅ Tabela todos: ${todosCount} registros`);
    console.log(`✅ Tabela todo_logs: ${logsCount} registros`);

    // 2. Buscar todos ativos (sem lastCompletedDate)
    console.log('\n2️⃣ Buscando todos ativos...');
    const activeTodos = await prisma.todo.findMany({
      where: {
        lastCompletedDate: null
      },
      take: 5
    });

    console.log(`✅ Todos ativos encontrados: ${activeTodos.length}`);
    activeTodos.forEach(todo => {
      console.log(`  - ${todo.title} (ID: ${todo.id})`);
    });

    // 3. Buscar logs de todos
    console.log('\n3️⃣ Buscando logs de todos...');
    const recentLogs = await prisma.todoLog.findMany({
      take: 5,
      orderBy: {
        completedAt: 'desc'
      }
    });

    console.log(`✅ Logs encontrados: ${recentLogs.length}`);
    recentLogs.forEach(log => {
      console.log(`  - ${log.todoTitle} completado em ${log.completedAt.toISOString()}`);
    });

    // 4. Testar endpoint simulation
    console.log('\n4️⃣ Simulando lógica do endpoint...');

    const allLogs = await prisma.todoLog.findMany();
    const allActiveTodos = await prisma.todo.findMany({
      where: { lastCompletedDate: null }
    });

    const combinedCount = allLogs.length + allActiveTodos.length;

    console.log(`✅ Total combinado: ${combinedCount}`);
    console.log(`  - Logs (completados): ${allLogs.length}`);
    console.log(`  - Todos ativos: ${allActiveTodos.length}`);

    // 5. Verificar se há inconsistências
    console.log('\n5️⃣ Verificando consistência...');

    const todosWithDate = await prisma.todo.findMany({
      where: {
        lastCompletedDate: {
          not: null
        }
      }
    });

    console.log(`✅ Todos com lastCompletedDate: ${todosWithDate.length}`);
    console.log(`✅ Razão logs/todos_com_data: ${logsCount}/${todosWithDate.length}`);

    if (logsCount !== todosWithDate.length) {
      console.log('⚠️ Possível inconsistência detectada!');
      console.log('   Alguns todos podem ter sido completados sem criar logs');
    } else {
      console.log('✅ Consistência mantida!');
    }

    console.log('\n🎉 Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste se arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testTodoLogsIntegration();
}

export { testTodoLogsIntegration };
