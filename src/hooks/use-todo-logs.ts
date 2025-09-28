import { useQuery } from "@tanstack/react-query";

interface TodoLog {
    id: string;
    todoId: string;
    todoTitle: string;
    completedAt: Date;
    difficulty: string;
    tags: string[];
    createdAt: Date;
}

async function fetchTodoLogs(): Promise<TodoLog[]> {
    const response = await fetch('/api/todo-logs');
    if (!response.ok) {
        throw new Error(`Erro ao buscar todo logs: ${response.status}`);
    }
    const data = await response.json();
    return data.todoLogs || [];
}

export function useTodoLogs() {
    return useQuery({
        queryKey: ["todoLogs"],
        queryFn: fetchTodoLogs,
    });
}