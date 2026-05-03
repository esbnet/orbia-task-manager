import type { HabitRepository, TodoRepository } from "@/domain/repositories/all-repository";

export interface ActiveTask {
  id: string;
  title: string;
  type: "habit" | "todo";
  difficulty: string;
  icon: string;
}

export interface GetActiveTasksOutput {
  tasks: ActiveTask[];
}

export class GetActiveTasksUseCase {
  constructor(
    private habitRepository: HabitRepository,
    private todoRepository: TodoRepository
  ) { }

  async execute(): Promise<GetActiveTasksOutput> {
    const [habits, todos] = await Promise.all([
      this.habitRepository.list().catch(() => []),
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