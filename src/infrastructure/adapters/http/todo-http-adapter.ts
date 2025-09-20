import type { Todo } from "@/domain/entities/todo";
import type { HttpClient } from "@/infra/services/http-client";

export interface TodoHttpAdapter {
  fetchTodos(): Promise<Todo[]>;
  createTodo(data: Omit<Todo, "id" | "createdAt">): Promise<Todo>;
  updateTodo(todo: Todo): Promise<Todo>;
  deleteTodo(id: string): Promise<void>;
  toggleComplete(id: string): Promise<Todo>;
}

export class FetchTodoHttpAdapter implements TodoHttpAdapter {
  private baseUrl = "/api/todos";

  constructor(private httpClient: HttpClient) {}

  async fetchTodos(): Promise<Todo[]> {
    const json = await this.httpClient.get<{ todos: Todo[] }>(this.baseUrl);
    return json.todos;
  }

  async createTodo(data: Omit<Todo, "id" | "createdAt">): Promise<Todo> {
    const json = await this.httpClient.post<{ todo: Todo }>(this.baseUrl, data);
    return json.todo;
  }

  async updateTodo(todo: Todo): Promise<Todo> {
    const json = await this.httpClient.patch<{ todo: Todo }>(this.baseUrl, { todo });
    return json.todo;
  }

  async deleteTodo(id: string): Promise<void> {
    await this.httpClient.delete(`${this.baseUrl}?id=${id}`);
  }

  async toggleComplete(id: string): Promise<Todo> {
    await this.httpClient.patch(this.baseUrl, { id });
    const todos = await this.fetchTodos();
    const todo = todos.find((t) => t.id === id);
    if (!todo) throw new Error(`Todo with id ${id} not found`);
    return todo;
  }
}