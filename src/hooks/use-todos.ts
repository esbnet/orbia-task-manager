import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Todo } from "@/types";

export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};

export function useTodos() {
  return useQuery({
    queryKey: todoKeys.lists(),
    queryFn: async (): Promise<Todo[]> => {
      const response = await fetch("/api/todos");
      if (!response.ok) {
        throw new Error("Erro ao buscar todos");
      }
      const data = await response.json();
      return data.todos || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Todo, "id" | "createdAt">): Promise<Todo> => {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar todo");
      }

      const result = await response.json();
      return result.todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Todo> }): Promise<Todo> => {
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, id }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar todo");
      }

      const result = await response.json();
      return result.todo;
    },
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(todoKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar todo");
      }
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

export function useCompleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Todo> => {
      const response = await fetch(`/api/todos/${id}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erro ao completar todo");
      }

      const result = await response.json();
      return result.todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}