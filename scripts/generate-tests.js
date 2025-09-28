import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Casos de uso que já têm testes
const existingTests = [
  'src/__tests__/use-cases/create-task',
  'src/__tests__/use-cases/list-tasks',
  'src/__tests__/use-cases/daily/create-daily',
  'src/__tests__/use-cases/daily/list-daily'
];

// Função para criar diretório se não existir
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Função para gerar teste básico
function generateTest(useCasePath, useCaseName) {
  const testDir = useCasePath.replace('src/application/use-cases', 'src/__tests__/use-cases');
  const testFile = path.join(testDir, `${useCaseName}.spec.ts`);

  // Verificar se o teste já existe
  if (fs.existsSync(testFile)) {
    console.log(`✅ Teste já existe: ${testFile}`);
    return;
  }

  createDirectory(testDir);

  // Tentar ler o use case para entender a estrutura
  const useCaseFile = path.join(useCasePath, `${useCaseName}-use-case.ts`);
  let useCaseContent = '';

  try {
    useCaseContent = fs.readFileSync(useCaseFile, 'utf8');
  } catch (error) {
    console.log(`⚠️  Não foi possível ler o use case: ${useCaseFile}`);
    return;
  }

  // Extrair informações básicas do use case
  const classMatch = useCaseContent.match(/export class (\w+)UseCase/);
  const className = classMatch ? classMatch[1] : useCaseName.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase());

  // Determinar o import correto baseado na categoria
  const category = useCasePath.split('/').slice(-2)[0]; // Pega o nome da categoria
  let repositoryImport = '';

  switch (category) {
    case 'daily':
    case 'daily-subtask':
      repositoryImport = 'InMemoryDailyRepository';
      break;
    case 'habit':
      repositoryImport = 'InMemoryHabitRepository';
      break;
    case 'todo':
    case 'todo-subtask':
      repositoryImport = 'InMemoryTodoRepository';
      break;
    case 'goal':
      repositoryImport = 'InMemoryGoalRepository';
      break;
    case 'tag':
      repositoryImport = 'InMemoryTagRepository';
      break;
    case 'user-config':
      repositoryImport = 'InMemoryUserConfigRepository';
      break;
    default:
      repositoryImport = 'InMemoryDailyRepository'; // fallback
  }

  // Gerar teste básico
  const testContent = `import { ${className}UseCase } from "@/application/use-cases/${category}/${useCaseName}/${useCaseName}-use-case";
import { ${repositoryImport} } from "@/infra/repositories/memory/in-memory-${category.includes('subtask') ? category.replace('-subtask', '').replace('daily', 'daily') : category}-repository";

describe("${className}UseCase", () => {
	let useCase: ${className}UseCase;
	let dailyRepository: InMemoryDailyRepository;

	beforeEach(() => {
		dailyRepository = new InMemoryDailyRepository();
		useCase = new ${className}UseCase(dailyRepository);
	});

	afterEach(async () => {
		// Limpar todos os dailies criados durante o teste
		const allDailies = await dailyRepository.list();
		for (const daily of allDailies) {
			await dailyRepository.delete(daily.id);
		}
	});

	it("deve executar o caso de uso com sucesso", async () => {
		// TODO: Implementar teste específico para ${className}UseCase
		const result = await useCase.execute();

		expect(result).toBeDefined();
	});
});
`;

  fs.writeFileSync(testFile, testContent);
  console.log(`✅ Teste criado: ${testFile}`);
}

// Função principal
function generateAllTests() {
  const useCasesDir = 'src/application/use-cases';

  // Lista de todos os casos de uso organizados por categoria
  const useCaseCategories = [
    {
      category: 'daily',
      cases: [
        'complete-daily',
        'complete-daily-with-log',
        'delete-daily',
        'get-available-dailies',
        'get-available-dailies-use-case',
        'toggle-complete-daily',
        'update-daily'
      ]
    },
    {
      category: 'habit',
      cases: [
        'complete-habit',
        'complete-habit-with-log',
        'create-habit',
        'delete-habit',
        'get-available-habits',
        'get-habit-stats-use-case',
        'get-habits-analytics-use-case',
        'list-habit',
        'register-habit-use-case',
        'toggle-complete-habit',
        'update-habit'
      ]
    },
    {
      category: 'todo',
      cases: [
        'complete-todo',
        'complete-todo-with-log',
        'delete-todo',
        'toggle-todo',
        'update-todo'
      ]
    },
    {
      category: 'task',
      cases: [
        'get-active-tasks'
      ]
    },
    {
      category: 'goal',
      cases: [
        'create-goal',
        'list-goals',
        'update-goal'
      ]
    },
    {
      category: 'daily-subtask',
      cases: [
        'create-daily-subtask',
        'delete-daily-subtask',
        'list-daily-subtask',
        'update-daily-subtask'
      ]
    },
    {
      category: 'todo-subtask',
      cases: [
        'verify-todo-ownership-use-case',
        'create-todo-subtask',
        'delete-todo-subtask',
        'list-todo-subtask',
        'update-todo-subtask'
      ]
    },
    {
      category: 'tag',
      cases: [
        'create-tag',
        'delete-tag',
        'list-tag',
        'update-tag'
      ]
    },
    {
      category: 'user-config',
      cases: [
        'get-user-config',
        'update-user-config'
      ]
    }
  ];

  console.log('🚀 Iniciando geração de testes...\n');

  let totalCreated = 0;
  let totalSkipped = 0;

  useCaseCategories.forEach(({ category, cases }) => {
    console.log(`📁 Categoria: ${category}`);

    cases.forEach(useCaseName => {
      const useCasePath = path.join(useCasesDir, category, useCaseName);

      if (fs.existsSync(useCasePath)) {
        generateTest(useCasePath, useCaseName);
        totalCreated++;
      } else {
        console.log(`❌ Diretório não encontrado: ${useCasePath}`);
        totalSkipped++;
      }
    });

    console.log('');
  });

  console.log(`📊 Resumo:`);
  console.log(`✅ Testes criados: ${totalCreated}`);
  console.log(`⏭️  Testes pulados: ${totalSkipped}`);
  console.log(`📝 Total de casos de uso processados: ${totalCreated + totalSkipped}`);
}

// Executar a geração de testes
generateAllTests();