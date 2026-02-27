import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import pkg from "pg";

const { Pool } = pkg;

function readEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return {};

  const data = readFileSync(envPath, "utf8");
  const result = {};

  for (const rawLine of data.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    const value = line
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (key) result[key] = value;
  }

  return result;
}

const envFromFile = readEnvFile();
const env = (key) => process.env[key] ?? envFromFile[key];

const isProduction = env("NODE_ENV") === "production";

const connectionString = isProduction
  ? env("PROD_DIRECT_URL") ||
    env("PROD_DATABASE_URL") ||
    env("DIRECT_URL") ||
    env("DATABASE_URL") ||
    env("DEV_DIRECT_URL") ||
    env("DEV_DATABASE_URL")
  : env("DIRECT_URL") ||
    env("DATABASE_URL") ||
    env("DEV_DIRECT_URL") ||
    env("DEV_DATABASE_URL") ||
    env("PROD_DIRECT_URL") ||
    env("PROD_DATABASE_URL");

if (!connectionString) {
  throw new Error(
    "DATABASE_URL/DIRECT_URL não definida para executar o seed do Prisma.",
  );
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Populando banco com dados de teste...');

  // Criar usuário de teste
  const user = await prisma.user.upsert({
    where: { id: 'temp-dev-user' },
    update: {},
    create: {
      id: 'temp-dev-user',
      name: 'Usuário de Teste',
      email: 'teste@example.com',
    },
  });

  console.log('👤 Usuário criado:', user.id);

  // Criar hábitos de teste
  const habits = await Promise.all([
    prisma.habit.create({
      data: {
        title: 'Fazer exercícios matinais',
        observations: 'Exercícios físicos pela manhã',
        difficulty: 'Médio',
        status: 'Em Andamento',
        priority: 'Alta',
        tags: ['saúde', 'fitness'],
        reset: 'Diariamente',
        userId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        title: 'Ler 30 minutos por dia',
        observations: 'Leitura diária para desenvolvimento pessoal',
        difficulty: 'Fácil',
        status: 'Em Andamento',
        priority: 'Média',
        tags: ['aprendizado', 'pessoal'],
        reset: 'Diariamente',
        userId: user.id,
      },
    }),
    prisma.habit.create({
      data: {
        title: 'Meditar diariamente',
        observations: 'Meditação para mindfulness',
        difficulty: 'Fácil',
        status: 'Em Andamento',
        priority: 'Baixa',
        tags: ['mente', 'bem-estar'],
        reset: 'Diariamente',
        userId: user.id,
      },
    }),
  ]);

  console.log('🔄 Hábitos criados:', habits.length);

  // Criar dailies de teste
  const dailies = await Promise.all([
    prisma.daily.create({
      data: {
        title: 'Revisar código',
        observations: 'Revisão diária do código desenvolvido',
        tasks: ['Verificar qualidade', 'Testar funcionalidades'],
        difficulty: 'Difícil',
        startDate: new Date(),
        repeatType: 'Diariamente',
        repeatFrequency: 1,
        tags: ['trabalho', 'desenvolvimento'],
        userId: user.id,
      },
    }),
    prisma.daily.create({
      data: {
        title: 'Fazer reunião diária',
        observations: 'Reunião stand-up com a equipe',
        tasks: ['Apresentar progresso', 'Discutir impedimentos'],
        difficulty: 'Médio',
        startDate: new Date(),
        repeatType: 'Diariamente',
        repeatFrequency: 1,
        tags: ['trabalho', 'comunicação'],
        userId: user.id,
      },
    }),
  ]);

  console.log('📅 Dailies criados:', dailies.length);

  // Criar todos de teste
  const todos = await Promise.all([
    prisma.todo.create({
      data: {
        title: 'Implementar nova feature',
        observations: 'Desenvolvimento da nova funcionalidade X',
        tasks: ['Análise de requisitos', 'Desenvolvimento', 'Testes'],
        difficulty: 'Difícil',
        startDate: new Date(),
        tags: ['desenvolvimento', 'feature'],
        userId: user.id,
      },
    }),
    prisma.todo.create({
      data: {
        title: 'Corrigir bugs',
        observations: 'Correção dos bugs reportados',
        tasks: ['Identificar bugs', 'Corrigir código', 'Testar correções'],
        difficulty: 'Médio',
        startDate: new Date(),
        tags: ['manutenção', 'bugs'],
        userId: user.id,
      },
    }),
    prisma.todo.create({
      data: {
        title: 'Atualizar documentação',
        observations: 'Atualização da documentação do projeto',
        tasks: ['Revisar docs existentes', 'Adicionar novos conteúdos'],
        difficulty: 'Fácil',
        startDate: new Date(),
        tags: ['documentação', 'manutenção'],
        userId: user.id,
      },
    }),
  ]);

  console.log('✅ Todos criados:', todos.length);

  console.log('🎉 Dados de teste criados com sucesso!');
  console.log('📊 Resumo:');
  console.log(`   - Hábitos: ${habits.length}`);
  console.log(`   - Dailies: ${dailies.length}`);
  console.log(`   - Todos: ${todos.length}`);
  console.log(`   - Total: ${habits.length + dailies.length + todos.length} tarefas`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao popular banco:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
