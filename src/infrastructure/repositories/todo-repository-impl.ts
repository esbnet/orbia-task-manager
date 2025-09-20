import type { Todo } from "@/domain/entities/todo";
import type { TodoRepository } from "@/domain/repositories/all-repository";
import type { TodoHttpAdapter } from "@/infrastructure/adapters/http/todo-http-adapter";

export class TodoRepositoryImpl implements TodoRepository {
  constructor(private httpAdapter: TodoHttpAdapter) {}

  async list(): Promise<Todo[]> {
    return await this.httpAdapter.fetchTodos();
  }

  async create(data: Omit<Todo, "id" | "createdAt">): Promise<Todo> {
    return await this.httpAdapter.createTodo(data);
  }

  async update(todo: Todo): Promise<Todo> {
    return await this.httpAdapter.updateTodo(todo);
  }

  async delete(id: string): Promise<void> {
    await this.httpAdapter.deleteTodo(id);
  }

  async toggleComplete(id: string): Promise<Todo> {
    return await this.httpAdapter.toggleComplete(id);
  }

  // Domain-specific methods
  async findByUserId(userId: string): Promise<Todo[]> {
    const todos = await this.list();
    return todos.filter(todo => todo.userId === userId);
  }

  async deleteByUserId(userId: string): Promise<void> {
    const todos = await this.findByUserId(userId);
    await Promise.all(todos.map(todo => this.delete(todo.id)));
  }

  async findById(id: string): Promise<Todo | null> {
    const todos = await this.list();
    return todos.find(todo => todo.id === id) || null;
  }

  async markComplete(id: string): Promise<Todo> {
    return await this.toggleComplete(id);
  }

  async markIncomplete(id: string): Promise<Todo> {
    return await this.toggleComplete(id);
  }

  async reorder(ids: string[]): Promise<void> {
    // Implementation would depend on API support
    throw new Error("Reorder not implemented in HTTP adapter");
  }

  async moveToPosition(id: string, position: number): Promise<Todo> {
    // Implementation would depend on API support
    throw new Error("Move to position not implemented in HTTP adapter");
  }

  async findByTags(tags: string[]): Promise<Todo[]> {
    const todos = await this.list();
    return todos.filter(todo => 
      tags.some(tag => todo.tags.includes(tag))
    );
  }

  async findByTag(tag: string): Promise<Todo[]> {
    return this.findByTags([tag]);
  }

  async getTagStats(): Promise<Array<{ tag: string; count: number }>> {
    const todos = await this.list();
    const tagCounts = new Map<string, number>();
    
    todos.forEach(todo => {
      todo.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries()).map(([tag, count]) => ({ tag, count }));
  }
}