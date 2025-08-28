import type { Todo } from "@/domain/entities/todo";
import type { TodoRepository } from "@/domain/repositories/all-repository";
import type { HttpClient } from "@/infra/services/http-client";
import { FetchHttpClient } from "@/infra/services/http-client";

export class ApiTodoRepository implements TodoRepository {
	private baseUrl = "/api/todos";
	private httpClient: HttpClient;

	constructor(httpClient?: HttpClient) {
		this.httpClient = httpClient || new FetchHttpClient();
	}
	findByUserId(userId: string): Promise<Todo[]> {
		throw new Error("Method not implemented." + userId);
	}
	deleteByUserId(userId: string): Promise<void> {
		throw new Error("Method not implemented." + userId);
	}
	findById(id: string): Promise<Todo | null> {
		throw new Error("Method not implemented." + id);
	}
	markComplete(id: string): Promise<Todo> {
		throw new Error("Method not implemented." + id);
	}
	markIncomplete(id: string): Promise<Todo> {
		throw new Error("Method not implemented." + id);
	}
	reorder(ids: string[]): Promise<void> {
		throw new Error("Method not implemented." + ids);
	}
	moveToPosition(id: string, position: number): Promise<Todo> {
		throw new Error("Method not implemented." + position + id);
	}
	findByTags(tags: string[]): Promise<Todo[]> {
		throw new Error("Method not implemented." + tags);
	}
	findByTag(tag: string): Promise<Todo[]> {
		throw new Error("Method not implemented." + tag);
	}

	async list(): Promise<Todo[]> {
		const json = await this.httpClient.get<{ todos: Todo[] }>(this.baseUrl);
		return json.todos;
	}

	async create(data: Omit<Todo, "id" | "createdAt">): Promise<Todo> {
		const json = await this.httpClient.post<{ todo: Todo }>(
			this.baseUrl,
			data,
		);
		return json.todo;
	}

	async update(todo: Todo): Promise<Todo> {
		const json = await this.httpClient.patch<{ todo: Todo }>(this.baseUrl, {
			todo,
		});
		return json.todo;
	}

	async toggleComplete(id: string): Promise<Todo> {
		await this.httpClient.patch(this.baseUrl, { id });
		const todo = (await this.list()).find((t) => t.id === id);
		if (!todo) throw new Error(`Todo with id ${id} not found`);
		return todo;
	}

	async delete(id: string): Promise<void> {
		await this.httpClient.delete(`${this.baseUrl}?id=${id}`);
	}
}
