import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedApi } from "./use-authenticated-api";

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
    const { isAuthenticated } = useAuthenticatedApi();

    return useQuery({
        queryKey: ["todoLogs"],
        queryFn: fetchTodoLogs,
        enabled: isAuthenticated,
    });
}
