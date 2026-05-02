import type { Todo } from "./types";

export interface TodoLogCreateData {
    todoId: string;
    todoTitle: string;
    difficulty: string;
    tags: string[];
    completedAt: Date;
}

export interface TodoLog {
    id: string;
    todoId: string;
    todoTitle: string;
    difficulty: string;
    tags: string[];
    completedAt: Date;
}

export interface TodoRepository {
    list(): Promise<Todo[]>;
    findById(id: string): Promise<Todo | null>;
    findByUserId(userId: string): Promise<Todo[]>;
    create(data: Omit<Todo, "id" | "createdAt" | "subtasks">): Promise<Todo>;
    update(todo: Todo): Promise<Todo>;
    delete(id: string): Promise<void>;
    toggleComplete(id: string): Promise<Todo>;
    markComplete(id: string): Promise<Todo>;
    markIncomplete(id: string): Promise<Todo>;
    reorder(ids: string[]): Promise<void>;
}

export interface TodoLogRepository {
    create(data: TodoLogCreateData): Promise<TodoLog>;
}
