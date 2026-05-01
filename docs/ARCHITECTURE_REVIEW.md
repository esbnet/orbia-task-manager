# 📋 Revisão da Funcionalidade: Reaparecimento de Tarefas Diárias

> Status de implementação (atualizado): parte das correções descritas abaixo foi aplicada e ampliada na codebase.
> Em especial: `dailies/*` foi consolidado como alias de `daily/*`, `daily/available` passou a usar use cases/factory, e o fluxo principal de conclusão de daily foi centralizado em `DailyApplicationService`.

## 🔍 Análise Realizada

### ❌ Problemas Identificados

1. **Violação da Clean Architecture na API**
   - `/api/daily/available/route.ts` continha lógica de negócio
   - Uso direto do `PrismaClient` na camada de apresentação
   - Funções duplicadas que já existiam no `DailyPeriodCalculator`

2. **Use Case Incompleto**
   - `GetAvailableDailiesUseCase` não considerava períodos (DailyPeriod)
   - Não havia reativação automática de períodos
   - Lógica de cálculo não usava o serviço de domínio

3. **Falta de Componente Crítico**
   - Não existia use case para reativar dailies após conclusão

## ✅ Correções Implementadas

### 1. **Novo Use Case: ReactivateDailyPeriodsUseCase**
**Camada:** Application  
**Localização:** `/src/application/use-cases/daily/reactivate-daily-periods/`

**Responsabilidades:**
- Verificar dailies que precisam de novo período ativo
- Criar períodos automaticamente quando o ciclo anterior termina
- Usar `DailyPeriodCalculator` para cálculos de datas

**Fluxo:**
```
1. Buscar todas as dailies do usuário
2. Para cada daily:
   - Verificar se tem período ativo
   - Se não tem e deveria ter (baseado em lastCompletedDate):
     - Calcular próxima data de início
     - Calcular data de fim do período
     - Criar novo período ativo
```

### 2. **Refatoração: GetAvailableDailiesUseCase**
**Mudanças:**
- Adicionado `DailyPeriodRepository` como dependência
- Removida lógica de cálculo manual (usa `DailyPeriodCalculator`)
- Agora verifica períodos ativos ao invés de apenas logs
- Simplificado para focar apenas em listar disponíveis

**Antes:**
```typescript
// Calculava manualmente datas
// Não considerava períodos
// Lógica duplicada
```

**Depois:**
```typescript
// Usa DailyPeriodCalculator
// Verifica períodos ativos
// Delega reativação para use case específico
```

### 3. **Refatoração: CompleteDailyWithLogUseCase**
**Mudanças:**
- Adicionado `DailyPeriodRepository` como dependência
- Finaliza período ativo ao concluir daily
- Vincula log ao período correto

**Fluxo Atualizado:**
```
1. Buscar período ativo da daily
2. Criar log de conclusão (com periodId)
3. Finalizar período ativo (isCompleted=true, isActive=false)
4. Atualizar lastCompletedDate da daily
```

### 4. **Refatoração: API Routes**

#### `/api/daily/available/route.ts`
**Antes:**
- 200+ linhas de código
- Lógica de negócio na API
- Uso direto do Prisma
- Funções duplicadas

**Depois:**
- ~40 linhas
- Apenas orquestração de use cases
- Usa repositórios através de use cases
- Clean Architecture respeitada

**Status atual no código:**
- ✅ Handler usa `UseCaseFactory`
- ✅ Executa `ReactivateDailyPeriodsUseCase` antes de listar
- ✅ Endpoint plural `/api/dailies/available` reexporta o handler de `/api/daily/available`

#### `/api/daily/[id]/complete/route.ts`
**Antes:**
- Lógica de conclusão na API
- Criação manual de períodos
- Uso direto do Prisma

**Depois:**
- Delega para `CompleteDailyWithLogUseCase`
- Apenas validação e resposta HTTP
- Clean Architecture respeitada

**Status atual no código (ajustado):**
- ✅ Endpoint `/api/daily/[id]/complete` e `/api/dailies/[id]/complete` foram consolidados para o mesmo fluxo
- ✅ Rotas delegam para `DailyApplicationService`
- ✅ Orquestração principal (períodos/log/next period) foi movida para `DailyApplicationService.completeDaily()`
- ⚠️ `PrismaDailyRepository.markComplete()` ainda existe como caminho legado/minimalista para compatibilidade

## 🏗️ Arquitetura Final

### Camadas Respeitadas

```
┌─────────────────────────────────────────────┐
│  Presentation (API Routes)                  │
│  - /api/daily/available                     │
│  - /api/daily/[id]/complete                 │
│  Responsabilidade: HTTP, Auth, Validação    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Application (Use Cases)                    │
│  - GetAvailableDailiesUseCase               │
│  - ReactivateDailyPeriodsUseCase ⭐ NOVO    │
│  - CompleteDailyWithLogUseCase              │
│  Responsabilidade: Orquestração, Regras     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Domain (Entities, Services)                │
│  - Daily, DailyPeriod, DailyLog             │
│  - DailyPeriodCalculator                    │
│  Responsabilidade: Lógica de Negócio        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Infrastructure (Repositories)              │
│  - PrismaDailyRepository                    │
│  - PrismaDailyLogRepository                 │
│  - PrismaDailyPeriodRepository              │
│  Responsabilidade: Persistência             │
└─────────────────────────────────────────────┘
```

## 🔄 Fluxo Completo de Reaparecimento

### 1. Conclusão de Daily
```
User → POST /api/daily/[id]/complete
  → CompleteDailyWithLogUseCase
    → Cria DailyLog
    → Finaliza DailyPeriod ativo
    → Atualiza Daily.lastCompletedDate
```

### 2. Listagem de Dailies Disponíveis
```
User → GET /api/daily/available
  → ReactivateDailyPeriodsUseCase
    → Verifica dailies sem período ativo
    → Cria novos períodos se necessário
  → GetAvailableDailiesUseCase
    → Lista dailies com período ativo
    → Separa completadas hoje
```

## 📊 Componentes por Camada

### Domain (Domínio)
- ✅ `Daily` - Entidade
- ✅ `DailyPeriod` - Entidade
- ✅ `DailyLog` - Entidade
- ✅ `DailyPeriodCalculator` - Serviço de Domínio

### Application (Aplicação)
- ✅ `GetAvailableDailiesUseCase` - Refatorado
- ✅ `CompleteDailyWithLogUseCase` - Refatorado
- ⭐ `ReactivateDailyPeriodsUseCase` - NOVO

### Infrastructure (Infraestrutura)
- ✅ `PrismaDailyRepository`
- ✅ `PrismaDailyLogRepository`
- ✅ `PrismaDailyPeriodRepository`

### Presentation (Apresentação)
- ✅ `/api/daily/available` - Refatorado
- ✅ `/api/daily/[id]/complete` - Refatorado

## ✨ Benefícios da Refatoração

1. **Separação de Responsabilidades**
   - Cada camada tem responsabilidade clara
   - Lógica de negócio isolada no domínio

2. **Testabilidade**
   - Use cases podem ser testados isoladamente
   - Fácil mockar dependências

3. **Manutenibilidade**
   - Código mais limpo e organizado
   - Fácil localizar e modificar funcionalidades

4. **Reutilização**
   - Use cases podem ser usados em outros contextos
   - Serviços de domínio compartilhados

5. **Princípios SOLID**
   - Single Responsibility ✅
   - Open/Closed ✅
   - Liskov Substitution ✅
   - Interface Segregation ✅
   - Dependency Inversion ✅

## 🎯 Resultado

A funcionalidade de reaparecimento de tarefas diárias agora:
- ✅ Respeita completamente a Clean Architecture
- ✅ Tem todos os componentes necessários
- ✅ Usa serviços de domínio para cálculos
- ✅ Separa responsabilidades corretamente
- ✅ É testável e manutenível
- ✅ Segue princípios SOLID

## 🔄 Evolução Pós-Revisão (consolidação arquitetural)

Além do escopo original desta revisão, a base também recebeu melhorias relacionadas:

- Endurecimento de rotas de `habits` e `todos` com auth + sanitização de IDs + erros mais consistentes
- Expansão do `UseCaseFactory` e `DI container` para fluxos de `habit`/`todo`
- Correção de inconsistência em `src/infra/di/container.ts` (`getPrismaTodoRepository`)
- Guardrails por ambiente em rotas de debug/migração (`ENABLE_DEBUG_API`, `ENABLE_MIGRATION_API`)
