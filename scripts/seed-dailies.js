import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDailies() {
  console.log('🌱 Populando banco com dailies de exemplo...');

  try {
    // Criar um usuário de exemplo se não existir
    const user = await prisma.user.upsert({
      where: { id: 'user-example' },
      update: {},
      create: { id: 'user-example' },
    });

    console.log('👤 Usuário criado/encontrado:', user.id);

    // Criar dailies de exemplo
    const dailies = [
      {
        title: 'Exercitar-se',
        observations: '30 minutos de exercício físico diário',
        tasks: ['Aquecimento', 'Exercício principal', 'Alongamento'],
        difficulty: 'Médio',
        startDate: new Date(),
        repeatType: 'Diariamente',
        repeatFrequency: 1,
        tags: ['saúde', 'exercício', 'bem-estar'],
        order: 1,
        userId: user.id,
      },
      {
        title: 'Ler livro',
        observations: 'Ler pelo menos 20 páginas de um livro',
        tasks: ['Escolher livro', 'Ler páginas', 'Fazer anotações'],
        difficulty: 'Fácil',
        startDate: new Date(),
        repeatType: 'Diariamente',
        repeatFrequency: 1,
        tags: ['leitura', 'conhecimento', 'desenvolvimento'],
        order: 2,
        userId: user.id,
      },
      {
        title: 'Meditar',
        observations: '10 minutos de meditação mindfulness',
        tasks: ['Preparar ambiente', 'Meditar', 'Reflexão'],
        difficulty: 'Fácil',
        startDate: new Date(),
        repeatType: 'Diariamente',
        repeatFrequency: 1,
        tags: ['bem-estar', 'mindfulness', 'saúde mental'],
        order: 3,
        userId: user.id,
      },
      {
        title: 'Estudar programação',
        observations: '1 hora de estudo de programação',
        tasks: ['Revisar conceitos', 'Praticar código', 'Fazer exercícios'],
        difficulty: 'Difícil',
        startDate: new Date(),
        repeatType: 'Diariamente',
        repeatFrequency: 1,
        tags: ['programação', 'estudo', 'carreira'],
        order: 4,
        userId: user.id,
      },
      {
        title: 'Organizar casa',
        observations: 'Organizar e limpar um cômodo da casa',
        tasks: ['Escolher cômodo', 'Organizar', 'Limpar'],
        difficulty: 'Médio',
        startDate: new Date(),
        repeatType: 'Semanalmente',
        repeatFrequency: 1,
        tags: ['organização', 'casa', 'limpeza'],
        order: 5,
        userId: user.id,
      }
    ];

    // Inserir dailies no banco (tabela dailys)
    for (const daily of dailies) {
      const created = await prisma.daily.create({
        data: daily,
      });
      console.log('📅 Daily criada:', created.title);
    }

    console.log('✅ Seed de dailies concluído!');
    console.log(`📊 Total de dailies criadas: ${dailies.length}`);

  } catch (error) {
    console.error('❌ Erro ao popular dailies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDailies();
