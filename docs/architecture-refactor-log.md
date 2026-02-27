# Consolidação das Modificações Arquiteturais e Code Review

## Objetivo

Registrar, em um único documento, as mudanças realizadas para alinhar a aplicação com os problemas identificados na revisão arquitetural, além dos principais achados da code review posterior.

## Escopo das mudanças

As modificações abaixo focaram em:

- Redução de duplicação entre rotas `daily` e `dailies`
- Migração de lógica de negócio da camada HTTP/infra para use cases/application services
- Endurecimento de autenticação, sanitização e tratamento de erro em rotas `habits` e `todos`
- Padronização via `UseCaseFactory` e `container`
- Redução de risco em rotas utilitárias/admin/debug
- Melhoria incremental de serviços legados (`infra/services/*`)

## Resumo Executivo

Resultado geral:

- A arquitetura ficou mais consistente com a direção de Clean Architecture (rotas mais finas, maior uso de use cases e services de aplicação).
- A duplicação residual no namespace `dailies` foi praticamente eliminada via aliases/reexports.
- `todos` e `habits` receberam hardening de auth/sanitização/erros e mais uso de DI/factory.
- Parte da lógica rica de conclusão de `daily` saiu do repositório Prisma e foi centralizada em `DailyApplicationService`.

Riscos remanescentes identificados na review:

- Inconsistência de auth fallback em `todos` (rota vs repositório Prisma)
- Possível regressão de comportamento em `TodoService.completeTodo()` (campo `log` não retornado)
- Possíveis breaking changes no namespace `/api/dailies/*` devido à consolidação por alias

## 1. Dailies / Daily (Consolidação e Fluxos)

### 1.1 Consolidação do namespace plural (`/api/dailies/*`)

As rotas no namespace `dailies` foram convertidas para aliases das rotas `daily`, reduzindo duplicação:

- `src/app/api/dailies/[id]/route.ts`
- `src/app/api/dailies/[id]/complete/route.ts`
- `src/app/api/dailies/available/route.ts`

Benefício:

- Um único ponto de manutenção para item, complete e available.

Impacto:

- O namespace plural passa a herdar integralmente os contratos HTTP do namespace singular.

### 1.2 `available` migrado para use cases

`src/app/api/daily/available/route.ts` foi refatorada para remover lógica de negócio embutida e passar a usar:

- `UseCaseFactory.createReactivateDailyPeriodsUseCase()`
- `UseCaseFactory.createGetAvailableDailiesUseCase()`

Fluxo atual:

1. Resolve auth (`getCurrentUserIdWithFallback`)
2. Reativa períodos elegíveis
3. Busca dailies disponíveis
4. Retorna payload com `success: true`

### 1.3 `complete` unificado com `DailyApplicationService`

`src/app/api/daily/[id]/complete/route.ts` passou a usar:

- `container.getDailyApplicationService().completeDaily(id)`

O endpoint legado/plural herda esse comportamento via alias.

Payload atual (singular e plural):

- `success`
- `message`
- `daily`
- `nextAvailableAt`

## 2. DailyApplicationService e Repositório Prisma (realocação de lógica)

### 2.1 Orquestração de conclusão movida para aplicação

`src/application/services/daily-application-service.ts` agora orquestra explicitamente o fluxo de conclusão:

1. Busca da daily
2. Garantia/criação do período ativo
3. Finalização do período
4. Criação de log
5. Criação do próximo período
6. Atualização de `lastCompletedDate`

Resultado:

- Lógica principal de negócio sai da infra e fica na camada de aplicação.

### 2.2 `PrismaDailyRepository.markComplete()` simplificado (legado)

`src/infra/database/prisma/prisma-daily-repository.ts`

- `markComplete()` foi reduzido para comportamento mínimo (`toggleComplete`)
- Comentário explícito de `LEGACY PATH` adicionado
- Lógica pesada anterior (períodos/logs) foi removida desse método

Observação:

- Mantido por compatibilidade de interface, mas com semântica reduzida.

## 3. Habits (hardening + uso de factory/use cases)

### 3.1 Rotas de completion e available

`src/app/api/habits/[id]/complete/route.ts`

- Auth check com `getCurrentUserIdWithFallback`
- Sanitização de `id` com `InputSanitizer`
- `PATCH` via `ToggleCompleteUseCase` (factory)
- `DELETE` via novo `MarkIncompleteHabitUseCase`
- Contrato `{ habit }` preservado

`src/app/api/habits/available/route.ts`

- Troca de instanciação manual por `UseCaseFactory.createGetAvailableHabitsUseCase()`

### 3.2 Nova rota `register` alinhada ao padrão DI/factory

`src/app/api/habits/[id]/register/route.ts`

- Auth check
- Sanitização/validação de `id`
- Uso de `UseCaseFactory.createRegisterHabitUseCase()`

Suporte adicionado:

- `src/infra/di/container.ts`
  - `getHabitPeriodRepository()`
  - `getHabitEntryRepository()`
- `src/infra/di/use-case-factory.ts`
  - `createRegisterHabitUseCase()`

### 3.3 Hardening de `src/app/api/habits/[id]/route.ts`

Melhorias:

- `GET`/`DELETE`: auth + sanitização + erro `400` para input inválido
- `PATCH`: correção de mapeamento de payload

Compatibilidade de payload no `PATCH`:

- Novo/real: `observations`, `reset`
- Legado: `description`, `resetType`

Mapeamento legado suportado:

- `description -> observations`
- `resetType (daily|weekly|monthly) -> reset (Diariamente|Semanalmente|Mensalmente)`

### 3.4 Hardening de `src/app/api/habits/route.ts`

Melhorias:

- `POST`: auth obrigatório
- `PUT`: auth obrigatório + uso de `UseCaseFactory.createToggleCompleteHabitUseCase()`
- `PATCH`/`DELETE`: auth, validação, sanitização e tratamento de erro mais consistente

## 4. Todos (hardening + padronização DI/factory)

### 4.1 Rotas principais

`src/app/api/todos/route.ts`

Aplicado em `GET`, `POST`, `PATCH`, `DELETE`:

- Auth check
- Sanitização de IDs (`PATCH`, `DELETE`)
- Migração para `UseCaseFactory`:
  - `createListTodosUseCase()`
  - `createCreateTodoUseCase()`
  - `createUpdateTodoUseCase()`
  - `createDeleteTodoUseCase()`

Observação:

- `PATCH` ainda usa `PrismaTodoRepository.findById()` para merge/checagem do registro existente.

### 4.2 Rotas de conclusão

`src/app/api/todos/[id]/complete/route.ts`

- Auth + validação/sanitização de `id`
- Uso de `UseCaseFactory.createToggleTodoUseCase()`

`src/app/api/todos/[id]/complete-pontual/route.ts`

- Auth + validação/sanitização de `id`
- Uso de `UseCaseFactory.createCompletePontualTodoUseCase()`
- Tratamentos de erro de negócio específicos mantidos (`400/404`)

### 4.3 Logs/count

`src/app/api/todos/logs/count/route.ts`

- Passou a usar `container.getTodoLogRepository()` em vez de instanciar `PrismaTodoLogRepository` diretamente.

## 5. Container / Factory (DI)

### 5.1 Correção real no container de `todo`

`src/infra/di/container.ts`

- `getPrismaTodoRepository()` foi corrigido
- Antes retornava `PrismaTodoLogRepository` (erro)
- Agora retorna `PrismaTodoRepository`

### 5.2 Novos factories adicionados

`src/infra/di/use-case-factory.ts`

Novos factories para `habit`:

- `createGetAvailableHabitsUseCase()`
- `createToggleCompleteHabitUseCase()`
- `createMarkIncompleteHabitUseCase()`
- `createRegisterHabitUseCase()`

Novos factories para `todo`:

- `createListTodosUseCase()`
- `createCreateTodoUseCase()`
- `createUpdateTodoUseCase()`
- `createDeleteTodoUseCase()`
- `createToggleTodoUseCase()`
- `createCompletePontualTodoUseCase()`

Também foi adicionado:

- `createReactivateDailyPeriodsUseCase()` (para fluxo de `dailies available`)

## 6. Repositórios Prisma (redução de dívida e aderência a interface)

### 6.1 `PrismaTodoRepository`

`src/infra/database/prisma/prisma-todo-repository.ts`

Métodos implementados que estavam `not implemented`:

- `findByUserId(userId)`
- `deleteByUserId(userId)`
- `markComplete(id)` (alias para `toggleComplete`)
- `markIncomplete(id)`
- `reorder(ids)`
- `moveToPosition(id, position)`

Impacto:

- Menor risco de runtime em services/use cases que dependem da interface completa.

### 6.2 `PrismaHabitRepository`

`src/infra/database/prisma/prisma-habit-repository.ts`

- Redução de duplicação entre `toggleComplete()` e `markComplete()`
- `toggleComplete()` passou a delegar para `markComplete()`
- `markComplete()` virou implementação canônica

## 7. Services legados (`infra/services/*`) com delegação para use cases

### 7.1 `DailyService`

`src/infra/services/daily-service.ts`

- `completeDaily()` passou a delegar para `DailyApplicationService.completeDaily(...)`

Efeito:

- Remove dependência do fluxo rico embutido no repositório Prisma.

### 7.2 `TodoService`

`src/infra/services/todo-service.ts`

- `completeTodo()` passou a delegar para `CompleteTodoWithLogUseCase` quando há `todoLogRepository`
- `toggleComplete()` passou a delegar para `ToggleTodoUseCase` quando há `todoLogRepository`

### 7.3 `HabitService`

`src/infra/services/habit-service.ts`

- `completeHabit()` delega criação de log para `CompleteHabitUseCase`
- `toggleComplete()` delega para `ToggleCompleteUseCase`
- `completeHabit()` agora usa `findById()` (melhora sobre `list()+find()`)

### 7.4 `ServiceContainer`

`src/infra/services/container.ts`

Novos repositórios de log no container:

- `getHabitLogRepository()`
- `getTodoLogRepository()`

Injeções atualizadas:

- `getHabitService()` agora recebe `HabitLogRepository`
- `getTodoService()` agora recebe `TodoLogRepository`

## 8. BaseEntityService (melhoria transversal)

`src/infra/services/base/entity-service.ts`

Mudanças:

- `GenericRepository` ganhou `findById?` opcional
- `BaseEntityService.update()` agora prefere `findById()` quando disponível
- Fallback para `list()+find()` mantido para compatibilidade

Benefício:

- Menor custo de leitura/consulta em services genéricos

## 9. Auth fallback de desenvolvimento (hardening)

`src/hooks/use-current-user.ts`

Melhorias:

- Fallback `temp-dev-user` explicitamente desabilitado em produção
- Flag `ENABLE_DEV_AUTH_FALLBACK=false` para desligar em dev
- `DEV_FALLBACK_USER_ID` para customização

Impacto:

- Menor risco de mascaramento de falhas de auth em produção

## 10. Rotas utilitárias/admin/debug (guardrails por ambiente)

Rotas ajustadas:

- `src/app/api/debug-session/route.ts`
- `src/app/api/auth-test/route.ts`
- `src/app/api/test-auth/route.ts`
- `src/app/api/migrate-all-data/route.ts`
- `src/app/api/migrate-habits/route.ts`

Guardrails adicionados:

- Debug/test:
  - habilitadas por padrão fora de produção
  - em produção exigem `ENABLE_DEBUG_API=true`
  - retornam `404` quando desabilitadas

- Migração:
  - habilitadas por padrão fora de produção
  - em produção exigem `ENABLE_MIGRATION_API=true`
  - continuam exigindo usuário autenticado

- Tratamento de erro:
  - padronizado, evitando serialização de objeto `error` cru

## 11. Documentação atualizada

Arquivos atualizados:

- `docs/codebase-overview.md`
- `ARCHITECTURE_REVIEW.md`

Objetivo das atualizações:

- refletir o estado da arquitetura após os refactors
- registrar melhorias já aplicadas e pontos ainda pendentes

## 12. Achados da Code Review (Findings)

### 12.1 High - Inconsistência de auth em `todos` (fallback na rota, auth estrita no repositório)

As rotas de `todos` validam auth com `getCurrentUserIdWithFallback()`, mas `PrismaTodoRepository` usa `getCurrentUser()`/`getCurrentUserId()` sem fallback.

Exemplos:

- `src/app/api/todos/route.ts`
- `src/app/api/todos/[id]/complete/route.ts`
- `src/infra/database/prisma/prisma-todo-repository.ts`

Risco:

- Em desenvolvimento, a rota pode passar no guard e a infra falhar/retornar vazio por ausência de sessão real.
- Pode gerar `500` ou respostas vazias mascaradas.

### 12.2 Medium - `TodoService.completeTodo()` deixou de retornar `log` no fluxo com `todoLogRepository`

`src/infra/services/todo-service.ts`

- O método continua tipado com `log?`, mas no caminho com `CompleteTodoWithLogUseCase` retorna apenas `{ todo }`.

Risco:

- Consumidores legados de service que esperam `result.log` podem quebrar silenciosamente.

### 12.3 Medium - Possíveis breaking changes em `/api/dailies/*` após alias para `/api/daily/*`

A consolidação por alias reduz duplicação, mas herda contratos do namespace singular:

- `DELETE /api/dailies/[id]` agora pode responder `204` sem body
- `/complete` passa a herdar payload rico (`success`, `message`, `daily`, `nextAvailableAt`)
- `/available` herda payload do singular (difere do payload antigo do plural)

Risco:

- Clientes externos que consumam `/api/dailies/*` podem sofrer quebra de contrato.

### 12.4 Low - `PrismaDailyRepository.markComplete()` manteve o nome, mas perdeu a semântica “rica”

`src/infra/database/prisma/prisma-daily-repository.ts`

- O método agora atua como wrapper mínimo de `toggleComplete()`.

Risco:

- Futuro consumidor pode inferir comportamento antigo (log/períodos) e receber apenas atualização simples.

## 13. Validação executada e limitações

### O que foi validado

- Revisão estrutural de diffs
- `git diff --check` (whitespace/patch integrity)

### Limitação do ambiente

Não foi possível rodar validação de compilação/testes:

- `pnpm exec tsc --noEmit` falhou com `Command "tsc" not found`
- Dependências locais não estavam instaladas no ambiente durante a revisão

## 14. Próximos passos recomendados

1. Corrigir a inconsistência de auth em `todos` (alinhar rota e repositório quanto ao fallback em dev)
2. Decidir contrato de `TodoService.completeTodo()` (restaurar `log` ou atualizar contrato/consumidores)
3. Documentar/deprecar formalmente os breaking changes de `/api/dailies/*` se houver clientes externos
4. Rodar validação local:
   - `pnpm install`
   - `pnpm exec tsc --noEmit`
   - testes focados em `daily`, `habits`, `todos`, `infra/services`

