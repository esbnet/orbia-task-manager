# Visão Geral da Codebase (Orbia)

## Resumo Executivo

O projeto **Orbia** é uma aplicação full-stack de produtividade pessoal (tarefas, dailies, hábitos, metas e analytics) construída com **Next.js App Router**, **TypeScript**, **Prisma** e **NextAuth**, com forte orientação a **Clean Architecture**.

A codebase demonstra uma separação clara de camadas (`domain`, `application`, `infra`, `app`), boa cobertura de testes para casos de uso e uma modelagem de domínio relativamente rica (incluindo logs e períodos para dailies/hábitos). Ao mesmo tempo, o estado atual indica uma **transição arquitetural em andamento**, com coexistência de endpoints/fluxos legados e refatorados.

## Stack Real (estado atual)

Baseado no código atual (`package.json`, configs e entrypoints):

- **Framework web**: `Next.js 15.3.6` (`package.json`)
- **UI**: `React 19` + `react-dom 19` (`package.json`)
- **Linguagem**: `TypeScript`
- **Estilização**: `Tailwind CSS 4`, Radix UI, utilitários (`clsx`, `tailwind-merge`)
- **Estado servidor/cache**: `@tanstack/react-query` (`src/components/providers/query-client-provider.tsx`)
- **Autenticação**: `next-auth` v5 beta com Google Provider (`src/auth.ts`)
- **ORM / Banco**: `Prisma 7` + PostgreSQL (`prisma/schema.prisma`, `src/infra/database/prisma/prisma-client.ts`)
- **Documentação API**: Swagger (`next-swagger-doc`, `swagger-jsdoc`, `swagger-ui-react`)
- **Testes**: `Vitest` (`vitest.config.ts`) com `jsdom`, além de libs de Testing Library
- **PWA**: `manifest.json`, `sw.js`, registro em `src/app/pwa-register.tsx`
- **i18n**: providers e middleware de locale (`src/app/layout.tsx`, `middleware.ts`, `src/i18n/*`)

## Arquitetura por Camadas

### 1. Domínio (`src/domain`)

Responsável por entidades, contratos e regras de negócio centrais:

- **Entidades**: `Daily`, `Todo`, `Habit`, `Goal`, `Tag`, `UserConfig`, logs/períodos/subtasks (`src/domain/entities/*`)
- **Value Objects**: `EntityId`, `Priority`, `TaskTitle`, `TodoType`, `UserId` (`src/domain/value-objects/*`)
- **Contratos de repositório**: interfaces para persistência e acesso a dados (`src/domain/repositories/*`)
- **Serviços de domínio**:
  - cálculo de períodos de daily (`src/domain/services/daily-period-calculator.ts`)
  - gerenciamento de períodos/streaks de hábitos (`src/domain/services/habit-period-manager.ts`, `src/domain/services/habit-streak-service.ts`)
- **Validação de domínio** (`src/domain/validation/*`)

Observação: há uso consistente de tipos/interfaces de domínio, mas parte da lógica ainda está descentralizada em camadas superiores/infra (ver seção de transição arquitetural).

### 2. Aplicação (`src/application`)

Camada de orquestração de regras de negócio via **use cases**:

- Estrutura granular por feature e ação (`create`, `list`, `update`, `delete`, `complete`, `archive`, etc.)
- Features cobertas:
  - `daily`
  - `todo`
  - `habit`
  - `tag`
  - `goal`
  - `user-config`
  - `task` (agregações como tarefas ativas)
  - `daily-subtask` e `todo-subtask`
- Presença de `DTOs` e alguns serviços de aplicação (`src/application/services/*`)

Exemplos:

- `src/application/use-cases/daily/get-available-dailies/get-available-dailies-use-case.ts`
- `src/application/use-cases/habit/complete-habit-with-log/complete-habit-with-log-use-case.ts`
- `src/application/use-cases/todo/complete-todo-with-log/complete-todo-with-log-use-case.ts`
- `src/application/use-cases/user-config/update-user-config/update-user-config-use-case.ts`

### 3. Infraestrutura (`src/infra`)

Implementa detalhes técnicos e integrações:

- **Prisma repositories** (`src/infra/database/prisma/*`)
  - persistência principal da aplicação
- **HTTP repositories/adapters** (`src/infra/repositories/http/*`, `src/infra/adapters/http/*`)
  - usados em alguns fluxos/abstrações específicas
- **Memory repositories** (`src/infra/repositories/memory/*`)
  - úteis para testes e cenários isolados
- **DI / factories** (`src/infra/di/container.ts`, `src/infra/di/use-case-factory.ts`)
- **Validação/sanitização** (`src/infra/validation/*`)
- **Serviços auxiliares** (`src/infra/services/*`)

### 4. Apresentação / Interface (`src/app`, `src/components`, `src/hooks`, `src/contexts`)

- **Next.js App Router** em `src/app/*`
- **API Routes** em `src/app/api/*`
- **Páginas autenticadas** agrupadas em `src/app/(home)/*`
- **Componentes UI e de feature** em `src/components/*`
- **Hooks de dados/ações** em `src/hooks/*`
- **Contexts** para estado local/coordenação entre componentes (`src/contexts/*`)

## Modelo de Domínio e Persistência (Prisma)

O schema Prisma (`prisma/schema.prisma`) mostra um domínio mais rico do que um simples CRUD:

- **Todos**
  - `Todo`
  - `TodoLog`
  - `TodoSubtask`
- **Dailies**
  - `Daily`
  - `DailyLog`
  - `DailySubtask`
  - `DailyPeriod` (controle de ciclo e reativação)
- **Hábitos**
  - `Habit`
  - `HabitLog`
  - `HabitPeriod`
  - `HabitEntry`
- **Organização**
  - `Tag`
  - `Goal` (e relacionamentos com tarefas)
- **Usuário e auth**
  - `User`, `Account`, `Session` (NextAuth)
  - `UserConfig`

Pontos relevantes do modelo:

- Entidades são vinculadas por `userId` (escopo multiusuário)
- Uso de arrays (`tags`, `tasks`) em várias tabelas
- Logs e períodos permitem histórico e regras temporais (principalmente em `Daily` e `Habit`)
- Estados como `status = active/archived` aparecem nas entidades de rotina

## Fluxo Aplicacional (Frontend -> API -> Use Cases -> Repositórios)

### Frontend (App Router + Providers)

O layout raiz (`src/app/layout.tsx`) injeta os providers principais:

- `I18nProvider`
- `AuthProvider` (`next-auth`)
- `QueryClientProviderWrapper` (React Query)
- `ThemeProviderWrapper`
- `Toaster`
- `PWARegister`

### Hooks e consumo de API

Os hooks em `src/hooks/*` usam `fetch` + React Query para leitura/mutação e invalidação de cache. Exemplo representativo:

- `src/hooks/use-dailies.ts`

Características observadas:

- query keys organizadas por feature
- invalidação entre domínios (ex.: dailies afetando contagens, metas e tarefas do dia)
- políticas de `staleTime`, `refetchOnWindowFocus`, `refetchInterval` ajustadas por caso

### API Routes

As rotas em `src/app/api/*` fazem, em geral:

1. autenticação/autorização
2. parse/validação (`zod`)
3. sanitização de input (`InputSanitizer`)
4. instanciação de repositório/use case
5. retorno HTTP/JSON

Exemplo:

- `src/app/api/daily/route.ts`

### Use Cases / Services / Repositórios

O desenho-alvo fica mais claro nas rotas e factories mais recentes:

- `src/infra/di/use-case-factory.ts` cria use cases por composição
- use cases orquestram regras de negócio
- repositórios Prisma persistem dados no PostgreSQL

Entretanto, ainda há casos em que regras de negócio/orquestração continuam na camada de infraestrutura (ver seção abaixo).

## Estado Arquitetural Atual (maturidade e transição)

A codebase tem uma base arquitetural forte, mas com **estilos coexistindo**.

### Sinais de maturidade

- Separação explícita por camadas (`domain`, `application`, `infra`, `app`)
- Muitos use cases pequenos e específicos
- Repositórios por contrato/implementação
- Testes organizados por nível
- Modelagem de domínio rica (períodos/logs/subtarefas)

### Sinais de transição/refatoração em andamento

- **Coexistência de endpoints duplicados/convergentes**
  - `/api/daily/*`
  - `/api/dailies/*`
  - ambos aparecem em `src/app/api/*`
- **Rotas ainda com lógica de negócio**
  - exemplo: `src/app/api/daily/available/route.ts` ainda calcula disponibilidade de dailies na própria rota
- **Repositórios Prisma com orquestração de domínio**
  - exemplo: `src/infra/database/prisma/prisma-daily-repository.ts` executa fluxo de conclusão com criação/finalização de período + criação de log em `markComplete`
- **Convivência de abordagens**
  - parte do sistema usa `UseCaseFactory`
  - parte instancia repositórios/use cases diretamente em rotas
  - parte ainda usa serviços de aplicação com responsabilidades amplas

Em resumo: a direção arquitetural é correta, mas a consolidação ainda não está completa.

### Atualização de status (após refactors executados)

Desde a criação desta visão, alguns pontos já foram parcialmente endereçados:

- `src/app/api/dailies/*` foi consolidado como alias de `src/app/api/daily/*` (redução de duplicação de rotas)
- `src/app/api/daily/available/route.ts` passou a usar `UseCaseFactory` + `ReactivateDailyPeriodsUseCase` + `GetAvailableDailiesUseCase`
- fluxo de conclusão de daily foi consolidado nas rotas para usar `DailyApplicationService`
- `DailyApplicationService.completeDaily()` passou a concentrar a orquestração principal (período + log + próximo período)
- `PrismaDailyRepository.markComplete()` foi reduzido para caminho legado/minimalista
- rotas de `habits` e `todos` receberam endurecimento de `auth`, sanitização de IDs e padronização de erros
- `UseCaseFactory` e `src/infra/di/container.ts` foram ampliados para cobrir mais casos de `habit` e `todo`
- rotas de debug/migração (`debug-session`, `auth-test`, `test-auth`, `migrate-*`) receberam guardrails por ambiente (`ENABLE_DEBUG_API`, `ENABLE_MIGRATION_API`)

## Autenticação e Segurança

### NextAuth

Configuração principal em `src/auth.ts`:

- `PrismaAdapter(prisma)`
- Google Provider (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- estratégia de sessão JWT
- callbacks ajustando `session.user.id`
- página customizada de login em `/auth/signin`

### Middleware

`middleware.ts`:

- protege rotas privadas (páginas e APIs)
- retorna `401` para APIs não autenticadas
- redireciona páginas para `/auth/signin`
- também configura cookie de locale e alguns headers de segurança

### Ponto de atenção (fallback de desenvolvimento)

Em `src/hooks/use-current-user.ts` existe fallback temporário com `temp-dev-user`:

- `getCurrentUserIdSafe()`
- `getCurrentUserIdWithFallback()`

Isso é útil para desenvolvimento, mas é um ponto sensível:

- pode mascarar problemas de auth em runtime
- amplia risco de comportamento divergente entre desenvolvimento e produção se não for bem isolado

## Frontend (componentes, hooks, providers, contexts)

### Estrutura

- `src/components/*`: componentes de UI e features (analytics, daily, habit, todo, dashboard, navigation, settings etc.)
- `src/hooks/*`: hooks de dados e comportamento
- `src/contexts/*`: contexts para estados/fluxos específicos

### Layout e áreas principais

Páginas principais sob `src/app/(home)/*`:

- `dashboard`
- `analytics`
- `metrics`
- `organize`
- `settings`

O layout autenticado (`src/app/(home)/layout.tsx`) valida sessão e organiza o shell da área logada.

### Providers

- `src/components/providers/session-provider.tsx` (SessionProvider do NextAuth)
- `src/components/providers/query-client-provider.tsx` (React Query + `GoalProvider`)
- `src/components/providers/i18n-provider.tsx`
- `src/components/providers/theme-provider-wrapper.tsx`

### Observação de desenho frontend

Há uso combinado de:

- React Query (estado servidor/cache)
- Contexts (estado de UI/feature)
- hooks por feature

Isso é coerente com uma UI mais complexa, mas exige disciplina de fronteiras para evitar duplicação de estado ao longo do tempo.

## Backend / API (organização e endpoints)

A pasta `src/app/api/*` está extensa e cobre várias áreas:

- `daily`, `dailies`
- `todos`
- `habits`
- `goals`
- `tags`
- `logs` (`daily-logs`, `todo-logs`, `habit-logs`)
- analytics (`analytics/*`)
- `time-tracking`
- `user/config`
- `docs` (Swagger)

Também existem rotas de suporte/diagnóstico/migração:

- `debug-session`
- `auth-test`, `test-auth`
- `migrate-all-data`, `migrate-habits`
- `habits-temp`, `habits-admin`

### Observação operacional

A presença dessas rotas indica um projeto em evolução ativa, com endpoints de produto convivendo com endpoints temporários/administrativos. Para manutenção futura, vale manter uma convenção explícita para rotas experimentais e rotas de produção.

## Testes e Qualidade

### Cobertura estrutural observada

Foram identificados **45 arquivos de teste** em `src/__tests__`, organizados em:

- `use-cases`
- `services`
- `repositories`
- `integration`

### Configuração de testes

`vitest.config.ts`:

- `environment: "jsdom"`
- `setupFiles: "./src/setupTests.ts"`
- plugins de React e paths TS

### Leitura de maturidade

Pontos positivos:

- boa presença de testes em casos de uso
- testes de integração para fluxos específicos (ex.: daily reactivation)
- estrutura de pastas orientada por responsabilidade

Risco residual:

- devido à coexistência de rotas/fluxos legados e refatorados, pode haver comportamento duplicado/inconsistente entre endpoints equivalentes se a cobertura não incluir ambos.

## Documentação Interna Existente

Além do `README.md`, a codebase possui documentos de suporte e revisão, por exemplo:

- `ARCHITECTURE_REVIEW.md`
- `HABIT_REQUIREMENTS_REVIEW.md`
- `docs/DAILY_REQUIREMENTS_REVIEW.md`
- `docs/STATUS_FIELD_FIX.md`
- `docs/STREAK_FUNCTIONALITY.md`

Isso é um ponto forte: o repositório preserva contexto de decisões e refatorações, não apenas o código final.

## Pontos Fortes

- Arquitetura em camadas bem explícita e consistente em boa parte da base
- Domínio rico (logs, períodos, subtarefas, metas, config de usuário)
- Forte uso de use cases para isolamento de regras
- Boa organização de componentes/hooks por feature
- Cobertura de testes relevante (especialmente em casos de uso)
- Integração de PWA, i18n, auth e analytics em uma única base
- Documentação interna de revisão arquitetural e funcional

## Pontos de Atenção / Dívida Técnica

- **Coexistência de rotas duplicadas** (`/api/daily/*` e `/api/dailies/*`) ainda existe no namespace, embora os handlers de `dailies` já estejam reexportando/aliasando `daily` em pontos-chave
- **Lógica de negócio em rotas** ainda aparece em alguns endpoints (ex.: disponibilidade de dailies)
- **Regra de negócio/orquestração em repositórios Prisma** ainda existe em alguns casos, embora o fluxo principal de `daily` tenha sido movido para `DailyApplicationService`
- **Fallback temporário de usuário (`temp-dev-user`)** pode mascarar bugs de autenticação
- **Mistura de estilos de composição** (factory, instanciação direta, application service) aumenta custo cognitivo
- **Rotas experimentais/admin** convivem com rotas de produto, agora com guardrails básicos por ambiente, mas ainda sem uma política de ciclo de vida/documentação centralizada

## Observações de Atualização

- O `README.md` descreve corretamente a intenção e o escopo do projeto, mas há itens desatualizados em relação ao código atual.
- Exemplo claro:
  - README menciona **Next.js 14**
  - código atual está em **Next.js 15.3.6**
  - código atual usa **React 19**
- Para consultas futuras, esta visão deve ser considerada mais fiel ao estado atual da implementação do que o README (até que o README seja atualizado).
