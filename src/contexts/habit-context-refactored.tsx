"use client";

import type { Habit } from "@/domain/entities/habit";
import type { HabitFormData } from "@/types";
import React from "react";
import { toast } from "sonner";

interface HabitService {
  list(): Promise<Habit[]>;
  create(data: HabitFormData): Promise<Habit>;
  update(id: string, data: Partial<Habit>): Promise<Habit>;
  delete(id: string): Promise<void>;
}

interface HabitContextType {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  createHabit: (data: HabitFormData) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  refreshHabits: () => Promise<void>;
  completeHabit: (habitId: string) => Promise<void>;
  toggleComplete: (habitId: string) => Promise<void>;
  updateStatus: (id: string, status: Habit["status"]) => Promise<void>;
  updatePriority: (id: string, priority: Habit["priority"]) => Promise<void>;
  getHabitsByStatus: (status: Habit["status"]) => Habit[];
  getHabitsByPriority: (priority: Habit["priority"]) => Habit[];
  reorderHabits: (habitIds: string[]) => Promise<void>;
}

const HabitContext = React.createContext<HabitContextType | undefined>(undefined);

const httpHabitService: HabitService = {
  async list(): Promise<Habit[]> {
    const response = await fetch('/api/habits');
    if (!response.ok) throw new Error('Failed to fetch habits');
    const data = await response.json();
    return data.habits;
  },

  async create(data: HabitFormData): Promise<Habit> {
    const response = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create habit');
    const result = await response.json();
    return result.habit;
  },

  async update(id: string, data: Partial<Habit>): Promise<Habit> {
    const response = await fetch('/api/habits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habit: { id, ...data } }),
    });
    if (!response.ok) throw new Error('Failed to update habit');
    const result = await response.json();
    return result.habit;
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete habit');
  },
};

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refreshHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await httpHabitService.list();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (data: HabitFormData) => {
    await httpHabitService.create(data);
    await refreshHabits();
  };

  const updateHabit = async (id: string, data: Partial<Habit>) => {
    await httpHabitService.update(id, data);
    await refreshHabits();
  };

  const deleteHabit = async (id: string) => {
    await httpHabitService.delete(id);
    await refreshHabits();
  };

  const completeHabit = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to complete habit');
      await refreshHabits();
      const habit = habits.find(h => h.id === habitId);
      toast.success(`Hábito "${habit?.title || 'Hábito'}" concluído!`);
    } catch (error) {
      toast.error('Erro ao concluir hábito. Tente novamente.');
      throw error;
    }
  };

  const toggleComplete = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      try {
        const isCompleted = habit.lastCompletedDate === new Date().toISOString().split("T")[0];
        const response = await fetch(`/api/habits/${habitId}/complete`, {
          method: isCompleted ? 'DELETE' : 'PATCH'
        });
        if (!response.ok) throw new Error('Failed to toggle habit completion');
        await refreshHabits();
        const actionText = isCompleted ? 'desmarcado' : 'concluído';
        toast.success(`Hábito "${habit.title}" ${actionText}!`);
      } catch (error) {
        toast.error('Erro ao alterar status do hábito. Tente novamente.');
        throw error;
      }
    }
  };

  const updateStatus = async (id: string, status: Habit["status"]) => {
    await httpHabitService.update(id, { status });
    await refreshHabits();
  };

  const updatePriority = async (id: string, priority: Habit["priority"]) => {
    await httpHabitService.update(id, { priority });
    await refreshHabits();
  };

  const getHabitsByStatus = (status: Habit["status"]) => {
    return habits.filter((habit) => habit.status === status);
  };

  const getHabitsByPriority = (priority: Habit["priority"]) => {
    return habits.filter((habit) => habit.priority === priority);
  };

  const reorderHabits = async (habitIds: string[]) => {
    try {
      const response = await fetch('/api/habits/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: habitIds }),
      });
      if (!response.ok) throw new Error('Failed to reorder habits');
      await refreshHabits();
      toast.success('Hábitos reordenados com sucesso!');
    } catch (error) {
      toast.error('Erro ao reordenar hábitos. Tente novamente.');
      throw error;
    }
  };

  React.useEffect(() => {
    refreshHabits();
  }, []);

  const contextValue: HabitContextType = {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    refreshHabits,
    completeHabit,
    toggleComplete,
    updateStatus,
    updatePriority,
    getHabitsByStatus,
    getHabitsByPriority,
    reorderHabits,
  };

  return (
    <HabitContext.Provider value={contextValue}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits(): HabitContextType {
  const context = React.useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabits deve ser usado dentro de um HabitProvider");
  }
  return context;
}

export { useHabits as useHabitContext };