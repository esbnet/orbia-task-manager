/**
 * Tipos canônicos do módulo Todo.
 * Fonte única de verdade — substitui:
 *   - src/domain/entities/todo.ts
 *   - src/types/todo.ts
 */

export type TodoDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";
export type TodoRecurrence = "none" | "daily" | "weekly" | "monthly" | "custom";
export type TodoType = "pontual" | "recorrente";

export interface TodoSubtask {
    id: string;
    title: string;
    completed: boolean;
    todoId: string;
    order: number;
    createdAt: Date;
}

/**
 * Entidade canônica Todo. Usada em todas as camadas do módulo.
 * `todoType` como string simples — sem Value Object nas fronteiras de módulo.
 */
export interface Todo {
    id: string;
    userId: string;
    title: string;
    observations: string;
    tasks: string[];
    difficulty: TodoDifficulty;
    startDate: Date;
    tags: string[];
    createdAt: Date;
    order?: number;
    lastCompletedDate?: string;
    lastCompletedAt?: Date;
    recurrence: TodoRecurrence;
    recurrenceInterval?: number;
    todoType: TodoType;
    subtasks?: TodoSubtask[];
}

// ---- Inputs de Use Cases ----

export interface CreateTodoInput {
    userId: string;
    title: string;
    observations: string;
    tasks: string[];
    difficulty: TodoDifficulty;
    startDate: Date;
    tags: string[];
    recurrence?: TodoRecurrence;
    todoType?: TodoType;
    recurrenceInterval?: number;
}

export interface UpdateTodoInput {
    id: string;
    userId: string;
    title: string;
    observations: string;
    tasks: string[];
    difficulty: TodoDifficulty;
    startDate: Date;
    tags: string[];
    createdAt: Date;
    recurrence: TodoRecurrence;
    recurrenceInterval?: number;
    todoType: TodoType;
}
