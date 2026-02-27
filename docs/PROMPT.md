# 🌟 Prompt para Criar Orbia - Task Manager com Clean Architecture

## 📋 Prompt Principal

```
Crie uma aplicação full-stack de gerenciamento de tarefas chamada "Orbia" usando Next.js 15, TypeScript, Prisma e Clean Architecture.

### Requisitos Funcionais:

1. **Três tipos de tarefas:**
   - Daily (Tarefas Diárias): Tarefas recorrentes com períodos (diário, semanal, mensal, anual)
   - Todo (Tarefas Pontuais): Tarefas únicas ou recorrentes
   - Habit (Hábitos): Tracking contínuo com reset periódico

2. **Sistema de Períodos:**
   - Cada daily tem períodos ativos que controlam quando aparecem
   - Após conclusão, criar novo período automaticamente
   - Reativar tarefas quando o período expira

3. **Funcionalidades:**
   - CRUD completo para cada tipo de tarefa
   - Sistema de subtarefas
   - Tags com cores personalizadas
   - Níveis de dificuldade
   - Dashboard com analytics
   - Histórico de conclusões (logs)
   - Modo foco e organizador de tarefas

4. **Autenticação:**
   - NextAuth v5 com Google OAuth
   - Middleware protegendo todas as rotas da API
   - Sessão JWT

### Requisitos Técnicos:

**Arquitetura:**
```
src/
├── domain/              # Entidades, interfaces de repositórios, serviços de domínio
├── application/         # Use cases, DTOs
├── infra/              # Repositórios Prisma, serviços externos
├── app/                # Next.js App Router, API routes
├── components/         # Componentes React
└── hooks/              # Custom hooks
```

**Stack:**
- Next.js 15 (App Router)
- TypeScript
- Prisma ORM + PostgreSQL
- NextAuth v5
- Tailwind CSS + Shadcn/ui
- TanStack Query
- Zod para validação

**Princípios SOLID:**
- Single Responsibility: Cada classe uma responsabilidade
- Open/Closed: Extensível sem modificar
- Liskov Substitution: Implementações substituíveis
- Interface Segregation: Interfaces específicas
- Dependency Inversion: Dependências abstraídas

**Padrões:**
- Repository Pattern
- Use Case Pattern
- Dependency Injection
- Value Objects

### Schema do Banco (Prisma):

```prisma
model Daily {
  id                String
  userId            String
  title             String
  observations      String
  tasks             String[]
  difficulty        String
  startDate         DateTime
  repeatType        String
  repeatFrequency   Int
  tags              String[]
  order             Int
  lastCompletedDate String?
  subtasks          DailySubtask[]
  periods           DailyPeriod[]
  logs              DailyLog[]
}

model DailyPeriod {
  id          String
  dailyId     String
  periodType  String
  startDate   DateTime
  endDate     DateTime?
  isCompleted Boolean
  isActive    Boolean
}

model DailyLog {
  id          String
  dailyId     String
  periodId    String?
  dailyTitle  String
  difficulty  String
  tags        String[]
  completedAt DateTime
}

model Todo {
  id                 String
  userId             String
  title              String
  observations       String
  tasks              String[]
  difficulty         String
  startDate          DateTime
  tags               String[]
  order              Int
  lastCompletedDate  String?
  recurrence         String
  recurrenceInterval Int?
  todoType           String
  subtasks           TodoSubtask[]
  logs               TodoLog[]
}

model Habit {
  id                String
  userId            String
  title             String
  observations      String
  difficulty        String
  status            String
  priority          String
  tags              String[]
  reset             String
  order             Int
  lastCompletedDate String?
  logs              HabitLog[]
  periods           HabitPeriod[]
  entries           HabitEntry[]
}
```

### Fluxo de Reativação de Dailies:

1. Usuário completa uma daily
2. Sistema finaliza período ativo (isCompleted=true, isActive=false)
3. Sistema cria log de conclusão
4. Sistema atualiza lastCompletedDate
5. Quando período expira, sistema cria novo período ativo
6. Daily reaparece na lista de disponíveis

### Performance:

- Carregar períodos e logs em uma única query com JOINs
- Evitar N+1 queries usando Promise.all() para operações em batch
- Cache de 5 minutos para listas de tarefas

### API Endpoints:

```
GET    /api/daily              # Listar dailies
POST   /api/daily              # Criar daily
PATCH  /api/daily              # Atualizar daily
DELETE /api/daily?id={id}      # Deletar daily
GET    /api/daily/available    # Listar disponíveis (com reativação)
POST   /api/daily/[id]/complete # Completar daily

GET    /api/todos              # Listar todos
POST   /api/todos              # Criar todo
PATCH  /api/todos              # Atualizar todo
DELETE /api/todos?id={id}      # Deletar todo

GET    /api/habits             # Listar hábitos
POST   /api/habits             # Criar hábito
PATCH  /api/habits             # Atualizar hábito
DELETE /api/habits?id={id}     # Deletar hábito

GET    /api/tags               # Listar tags
POST   /api/tags               # Criar tag
```

### Componentes UI:

- DailyColumn: Lista de dailies com filtros
- TodoColumn: Lista de todos
- HabitColumn: Lista de hábitos com tracking
- Analytics: Dashboard com gráficos (Recharts)
- Organizer: Ferramentas de organização
- Forms: Formulários com React Hook Form + Zod

### Middleware de Autenticação:

```typescript
// Proteger todas as rotas exceto:
// - /auth/signin
// - /api/auth/*
// - /_next/*
// - arquivos estáticos

// Retornar 401 para APIs sem auth
// Redirecionar para /auth/signin para páginas sem auth
```

### Variáveis de Ambiente:

```env
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

Implemente seguindo rigorosamente Clean Architecture, com separação clara entre camadas e dependências sempre apontando para dentro (domain ← application ← infra ← app).
```

## 🎯 Prompts Complementares

### Para Otimização de Performance:

```
Otimize o carregamento de dailies:
1. Incluir períodos ativos e logs de hoje na query inicial usando Prisma include
2. Eliminar N+1 queries fazendo JOINs
3. Processar dados em memória ao invés de múltiplas queries
4. Reduzir de 2N queries para 1 query única
```

### Para Sistema de Períodos:

```
Implemente sistema de períodos para dailies:
1. DailyPeriodCalculator: Serviço de domínio para calcular datas
2. ReactivateDailyPeriodsUseCase: Criar períodos quando expiram
3. CompleteDailyWithLogUseCase: Finalizar período ao completar
4. GetAvailableDailiesUseCase: Listar dailies com períodos ativos
```

### Para Autenticação:

```
Configure NextAuth v5 com:
1. Google OAuth provider
2. Prisma adapter
3. JWT session strategy
4. Middleware protegendo rotas
5. trustHost: true para produção
6. Callbacks para adicionar userId na sessão
```

### Para UI/UX:

```
Crie interface com:
1. Três colunas: Daily, Todo, Habit
2. Cards com drag-and-drop (opcional)
3. Formulários modais com validação
4. Dashboard com gráficos de produtividade
5. Tema dark/light com next-themes
6. Responsivo mobile-first
```

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "next": "15.3.1",
    "react": "^19.0.0",
    "next-auth": "5.0.0-beta.29",
    "@prisma/client": "6.15.0",
    "@tanstack/react-query": "^5.85.6",
    "zod": "^4.1.5",
    "date-fns": "^4.1.0",
    "recharts": "2.15.4",
    "tailwindcss": "^4",
    "lucide-react": "^0.506.0"
  },
  "devDependencies": {
    "prisma": "6.15.0",
    "typescript": "^5",
    "vitest": "^3.1.2"
  }
}
```

## 🚀 Comandos de Setup

```bash
# 1. Criar projeto
npx create-next-app@latest orbia --typescript --tailwind --app

# 2. Instalar dependências
npm install @prisma/client next-auth@beta @tanstack/react-query zod date-fns recharts

# 3. Instalar dev dependencies
npm install -D prisma @types/node vitest

# 4. Inicializar Prisma
npx prisma init

# 5. Configurar schema e push
npx prisma db push

# 6. Gerar cliente
npx prisma generate

# 7. Rodar desenvolvimento
npm run dev
```

## ✅ Checklist de Implementação

- [ ] Setup inicial do projeto
- [ ] Configurar Prisma com PostgreSQL
- [ ] Criar schema completo
- [ ] Implementar camada de domínio (entities, repositories)
- [ ] Implementar use cases (application)
- [ ] Implementar repositórios Prisma (infra)
- [ ] Criar API routes (app/api)
- [ ] Configurar NextAuth
- [ ] Criar middleware de autenticação
- [ ] Implementar componentes UI
- [ ] Adicionar sistema de períodos
- [ ] Otimizar queries (eliminar N+1)
- [ ] Adicionar analytics/dashboard
- [ ] Testes unitários (opcional)
- [ ] Deploy na Vercel

## 🎨 Cores e Tema

```css
Daily: blue-600 (Azul)
Todo: green-600 (Verde)
Habit: purple-600 (Roxo)
Tags: Personalizáveis
```

---

**Nota:** Este prompt foi criado baseado na aplicação Orbia real, implementada com Clean Architecture e princípios SOLID.
