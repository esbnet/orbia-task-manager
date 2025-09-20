import type { HabitRepository } from "@/domain/repositories/habit-repository";
import type { DailyRepository } from "@/domain/repositories/daily-repository";
import type { TodoRepository } from "@/domain/repositories/todo-repository";

export interface ActiveTask {
  id: string;
  title: string;
  type: "habit" | "daily" | "todo";
  difficulty: string;
  icon: string;
}

export interface GetActiveTasksOutput {
  tasks: ActiveTask[];
}

export class GetActiveTasksUseCase {
  constructor(
    private habitRepository: HabitRepository,
    private dailyRepository: DailyRepository,
    private todoRepository: TodoRepository
  ) {}

  async execute(): Promise<GetActiveTasksOutput> {
    const [habits, dailies, todos] = await Promise.all([
      this.habitRepository.list().catch(() => []),
      this.dailyRepository.list().catch(() => []),
      this.todoRepository.list().catch(() => []),
    ]);

    const activeTasks: ActiveTask[] = [];

    // Adicionar hábitos ativos
    habits.forEach((habit) => {
      if (habit.status === "Em Andamento") {
        activeTasks.push({
          id: habit.id,
          title: habit.title,
          type: "habit",
          difficulty: habit.difficulty,
          icon: "🔄",
        });
      }
    });

    // Adicionar dailies
    dailies.forEach((daily) => {
      activeTasks.push({
        id: daily.id,
        title: daily.title,
        type: "daily",
        difficulty: daily.difficulty,
        icon: "📅",
      });
    });

    // Adicionar todos
    todos.forEach((todo) => {
      activeTasks.push({
        id: todo.id,
        title: todo.title,
        type: "todo",
        difficulty: todo.difficulty,
        icon: "✅",
      });
    });

    return { tasks: activeTasks };
  }
}