# 🚀 Implementação das Chamadas à API - Hábitos

## 📋 **Visão Geral**

Este documento descreve a implementação das chamadas reais à API para o sistema de hábitos, substituindo os dados mockados por integrações reais com o backend.

## ✅ **Implementações Realizadas**

### 🔧 **1. Contexto Principal (habit-context.tsx)**

**Funções implementadas com chamadas reais à API:**

#### **📥 fetchHabits()**
```typescript
const fetchHabits = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await listHabitUseCase.execute();
    setHabits(result.habits);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Erro ao carregar hábitos");
  } finally {
    setLoading(false);
  }
}, [listHabitUseCase]);
```

#### **➕ createHabit()**
```typescript
const createHabit = async (data: HabitFormData) => {
  try {
    const result = await createHabitUseCase.execute({
      title: data.title,
      observations: data.observations,
      difficulty: data.difficulty,
      priority: data.priority,
      category: data.category,
      tags: data.tags,
      reset: data.reset,
      createdAt: new Date(),
    });
    
    setHabits((prev) => [result.habit, ...prev]);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Erro ao criar hábito");
  }
};
```

#### **✏️ updateHabit()**
```typescript
const updateHabit = async (id: string, data: Partial<Habit>) => {
  try {
    const currentHabit = habits.find(h => h.id === id);
    if (!currentHabit) {
      throw new Error("Hábito não encontrado");
    }
    
    const updatedHabit = { ...currentHabit, ...data, updatedAt: new Date() };
    const result = await updateHabitUseCase.execute(updatedHabit);
    
    setHabits((prev) => prev.map((habit) => habit.id === id ? result : habit));
  } catch (err) {
    setError(err instanceof Error ? err.message : "Erro ao atualizar hábito");
  }
};
```

#### **🗑️ deleteHabit()**
```typescript
const deleteHabit = async (id: string) => {
  try {
    await deleteHabitUseCase.execute({ id });
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  } catch (err) {
    setError(err instanceof Error ? err.message : "Erro ao deletar hábito");
  }
};
```

#### **✅ completeHabit()**
```typescript
const completeHabit = async (habit: Habit) => {
  try {
    const updatedHabit = await habitRepository.toggleComplete(habit.id);
    setHabits((prevHabits) => 
      prevHabits.map((h) => h.id === habit.id ? updatedHabit : h)
    );
  } catch (err) {
    setError(err instanceof Error ? err.message : "Erro ao completar hábito");
  }
};
```

### 🔧 **2. Contexto Refatorado (habit-context-refactored.tsx)**

**Migrado de mock para service real:**

```typescript
// ANTES (mock)
const mockHabitService = { /* dados mockados */ };

// DEPOIS (API real)
const habitService = container.getHabitService();
```

**Funções específicas usando API real:**
- `completeHabit()` → `habitService.completeHabit()`
- `toggleComplete()` → `habitService.toggleComplete()`
- `updateStatus()` → `habitService.updateStatus()`
- `updatePriority()` → `habitService.updatePriority()`
- `updateCategory()` → `habitService.updateCategory()`
- `reorderHabits()` → `habitService.reorderHabits()`

### 🔧 **3. Container de Injeção de Dependência**

**Atualizado para usar ApiHabitRepository:**

```typescript
// ANTES
import { PrismaHabitRepository } from "@/infra/repositories/database/prisma-habit-repository";

private getHabitRepository() {
  this.repositories.set("habit", new PrismaHabitRepository());
}

// DEPOIS  
import { ApiHabitRepository } from "@/infra/repositories/backend/api-habit-repository";

private getHabitRepository() {
  this.repositories.set("habit", new ApiHabitRepository());
}
```

### 🔧 **4. ApiHabitRepository Completo**

**Implementados todos os métodos da interface HabitRepository:**

- ✅ **BaseRepository**: `list()`, `findById()`, `create()`, `update()`, `delete()`
- ✅ **UserOwnedRepository**: `findByUserId()`, `deleteByUserId()`
- ✅ **CompletableRepository**: `markComplete()`, `markIncomplete()`, `toggleComplete()`
- ✅ **OrderableRepository**: `reorder()`, `moveToPosition()`
- ✅ **TaggableRepository**: `findByTags()`, `findByTag()`

## 🎯 **Endpoints da API**

### **Endpoints implementados no ApiHabitRepository:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/habits` | Listar todos os hábitos |
| `GET` | `/api/habits/:id` | Buscar hábito por ID |
| `GET` | `/api/habits?userId=:userId` | Buscar hábitos por usuário |
| `GET` | `/api/habits?tags=:tags` | Buscar hábitos por tags |
| `POST` | `/api/habits` | Criar novo hábito |
| `PATCH` | `/api/habits` | Atualizar hábito |
| `PATCH` | `/api/habits/:id/complete` | Marcar como completo |
| `PATCH` | `/api/habits/:id/incomplete` | Marcar como incompleto |
| `PATCH` | `/api/habits/:id/position` | Mover para posição |
| `PATCH` | `/api/habits/reorder` | Reordenar hábitos |
| `DELETE` | `/api/habits?id=:id` | Deletar hábito |
| `DELETE` | `/api/habits?userId=:userId` | Deletar todos os hábitos do usuário |

## 🔄 **Fluxo de Dados**

```
UI Component → Context → Use Case → Repository → API → Backend
     ↓           ↓         ↓          ↓         ↓        ↓
HabitCard → useHabits → CreateHabitUseCase → ApiHabitRepository → /api/habits
```

## 🛠️ **Como Usar**

### **1. Contexto Principal**
```typescript
import { useHabits } from "@/contexts/habit-context";

const { habits, createHabit, updateHabit, deleteHabit, completeHabit } = useHabits();
```

### **2. Contexto Refatorado (Recomendado)**
```typescript
import { useHabits } from "@/contexts/habit-context-refactored";

const { habits, createHabit, completeHabit, toggleComplete } = useHabits();
```

## 🎉 **Benefícios Alcançados**

- ✅ **Dados reais** do backend
- ✅ **Persistência** de dados
- ✅ **Sincronização** entre dispositivos
- ✅ **Validação** no servidor
- ✅ **Error handling** robusto
- ✅ **Loading states** adequados
- ✅ **Arquitetura limpa** mantida

## 🚀 **Próximos Passos**

1. **Implementar autenticação** para associar hábitos aos usuários
2. **Adicionar cache** para melhorar performance
3. **Implementar offline support** com sincronização
4. **Adicionar testes** para as integrações da API
5. **Monitoramento** de erros e performance

A implementação das chamadas à API está completa e funcional! 🎯
