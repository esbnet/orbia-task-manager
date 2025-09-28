# 🔥 Funcionalidade de Streak - Hábitos

## Visão Geral

A funcionalidade de streak (sequência) permite aos usuários acompanhar sua consistência na execução de hábitos, fornecendo motivação através de métricas visuais de progresso contínuo.

## Como Funciona

### Cálculo de Streak

O streak é calculado baseado na continuidade de períodos com atividade:

1. **Períodos Consecutivos**: Conta períodos consecutivos que possuem pelo menos uma entrada
2. **Quebra de Sequência**: Quando um período não possui atividade, o streak é quebrado
3. **Tipos de Reset**: Considera o tipo de reset do hábito (Diário, Semanal, Mensal)

### Componentes Principais

#### 1. HabitStreakService
```typescript
// Localização: src/domain/services/habit-streak-service.ts
class HabitStreakService {
  static calculateStreak(habit, periods, entries): StreakInfo
  static isPeriodComplete(period, entries): boolean
  static calculatePeriodProgress(period): number
}
```

**Responsabilidades:**
- Calcular streak atual e recorde
- Verificar se há atividade hoje
- Determinar se períodos estão completos
- Calcular progresso em relação às metas

#### 2. HabitPeriodManager
```typescript
// Localização: src/domain/services/habit-period-manager.ts
class HabitPeriodManager {
  async finalizeExpiredPeriods(): Promise<void>
  shouldFinalizePeriod(period): boolean
  getNextAvailableDate(period): Date
}
```

**Responsabilidades:**
- Finalizar períodos expirados
- Gerenciar transições entre períodos
- Calcular próximas datas disponíveis

#### 3. GetHabitStatsUseCase
```typescript
// Localização: src/application/use-cases/habit/get-habit-stats-use-case/
interface GetHabitStatsOutput {
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate?: Date;
    isActiveToday: boolean;
  }
}
```

### Interface do Usuário

#### HabitCard
- **Indicador de Streak**: Exibe streak atual com ícone de fogo 🔥
- **Status Hoje**: Mostra se o hábito foi executado hoje
- **Seção Expandida**: Detalhes completos do streak (atual vs recorde)

```tsx
// Exemplo de exibição
{streak && streak.currentStreak > 0 && (
  <div className="flex items-center gap-1">
    <span className="text-orange-600">🔥</span>
    <span className="font-medium text-orange-600">
      {streak.currentStreak} dias
    </span>
  </div>
)}
```

## Regras de Negócio

### 1. Tipos de Reset e Streak

| Tipo | Período | Quebra de Streak |
|------|---------|------------------|
| Diariamente | 24 horas | > 1 dia sem atividade |
| Semanalmente | 7 dias | > 7 dias sem atividade |
| Mensalmente | 30 dias | > 30 dias sem atividade |

### 2. Validação de Períodos

- **Período Ativo**: Apenas um período pode estar ativo por hábito
- **Finalização Automática**: Períodos expirados são finalizados automaticamente
- **Criação de Novos Períodos**: Novos períodos são criados quando necessário

### 3. Cálculo de Atividade

- **Entrada Mínima**: Pelo menos uma entrada no período para contar
- **Meta Opcional**: Se definida, pode influenciar na completude do período
- **Timestamp**: Considera o horário real da atividade

## API Endpoints

### GET /api/habits/[id]/stats
Retorna estatísticas completas do hábito incluindo streak:

```json
{
  "habitId": "habit-123",
  "habitTitle": "Exercitar-se",
  "streak": {
    "currentStreak": 7,
    "longestStreak": 15,
    "lastCompletedDate": "2024-01-15T10:30:00Z",
    "isActiveToday": true
  },
  "currentPeriod": {
    "period": {
      "count": 1,
      "target": 1
    },
    "completionRate": 100
  }
}
```

### POST /api/habits/cleanup-periods
Finaliza períodos expirados (pode ser chamado por cron job):

```json
{
  "success": true,
  "message": "Períodos expirados finalizados com sucesso"
}
```

## Hooks Personalizados

### useHabitStats
```typescript
const { data: stats } = useHabitStats(habitId);
// Retorna estatísticas incluindo streak
```

### useMultipleHabitStats
```typescript
const { data: allStats } = useMultipleHabitStats(habitIds);
// Retorna estatísticas para múltiplos hábitos
```

## Estrutura do Banco de Dados

### Tabelas Relacionadas

1. **habits**: Informações básicas do hábito
2. **habit_periods**: Períodos de atividade
3. **habit_entries**: Registros individuais de atividade

### Relacionamentos
```
Habit (1) -> (N) HabitPeriod (1) -> (N) HabitEntry
```

## Testes

### Cenários Cobertos

1. **Streak Contínuo**: Períodos consecutivos com atividade
2. **Quebra de Streak**: Períodos sem atividade
3. **Streak Zero**: Hábitos sem registros
4. **Cálculo de Progresso**: Metas e percentuais
5. **Atividade Hoje**: Detecção de atividade no dia atual

### Executar Testes
```bash
npm test -- habit-streak-service.test.ts
```

## Melhorias Futuras

### Funcionalidades Planejadas

1. **Streak Freezes**: Permitir "congelar" streak em situações especiais
2. **Streak Rewards**: Sistema de recompensas por marcos
3. **Streak Sharing**: Compartilhar conquistas
4. **Streak Analytics**: Análises avançadas de padrões
5. **Streak Notifications**: Lembretes baseados em streak

### Otimizações

1. **Cache de Estatísticas**: Cache Redis para stats frequentes
2. **Batch Processing**: Processamento em lote de períodos
3. **Background Jobs**: Finalização automática via cron
4. **Índices de Banco**: Otimização de queries

## Troubleshooting

### Problemas Comuns

1. **Streak Não Atualiza**: Verificar se períodos estão sendo finalizados
2. **Contagem Incorreta**: Validar timestamps das entradas
3. **Performance Lenta**: Verificar índices e queries N+1

### Debug

```typescript
// Verificar períodos ativos
const activePeriods = await habitPeriodRepository.findActiveByHabitId(habitId);

// Verificar entradas de hoje
const todayEntries = await habitEntryRepository.findTodayByHabitId(habitId);

// Calcular streak manualmente
const streak = HabitStreakService.calculateStreak(habit, periods, entries);
```

## Conclusão

A funcionalidade de streak fornece uma ferramenta poderosa de motivação e acompanhamento para usuários, implementada seguindo os princípios da Clean Architecture e com cobertura completa de testes.