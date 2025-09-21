import type { TodoSubtask } from "@/domain/entities/todo-subtask";
import type { TodoSubtaskRepository } from "@/domain/repositories/all-repository";
import type { HttpClient } from "@/infra/services/http-client";
import { FetchHttpClient } from "@/infra/services/http-client";

export class ApiTodoSubtaskRepository implements TodoSubtaskRepository {
	private baseUrl = "/api/todo-subtasks";
	private httpClient: HttpClient;

	constructor(httpClient?: HttpClient) {
		this.httpClient = httpClient || new FetchHttpClient();
	}
	async findByParentId(parentId: string): Promise<TodoSubtask[]> {
		return this.listByTodoId(parentId);
	}

	async deleteByParentId(parentId: string): Promise<void> {
		await this.httpClient.delete(`${this.baseUrl}/by-todo/${parentId}`);
	}

	async reorderByParentId(parentId: string, ids: string[]): Promise<void> {
		await this.httpClient.patch(`${this.baseUrl}/reorder/${parentId}`, { ids });
	}

	async findById(id: string): Promise<TodoSubtask | null> {
		const json = await this.httpClient.get<{ subtask: TodoSubtask | null }>(
			`${this.baseUrl}/${id}`
		);
		return json.subtask;
	}

	async list(): Promise<TodoSubtask[]> {
		const json = await this.httpClient.get<{ subtasks: TodoSubtask[] }>(this.baseUrl);
		return json.subtasks;
	}

	async toggleComplete(id: string): Promise<TodoSubtask> {
		const json = await this.httpClient.patch<{ subtask: TodoSubtask }>(
			`${this.baseUrl}/${id}/toggle`,
			{}
		);
		return json.subtask;
	}

	async listByTodoId(todoId: string): Promise<TodoSubtask[]> {
		const json = await this.httpClient.get<{ subtasks: TodoSubtask[] }>(
			`${this.baseUrl}?todoId=${todoId}`,
		);
		return json.subtasks;
	}

	async create(
		data: Omit<TodoSubtask, "id" | "createdAt">,
	): Promise<TodoSubtask> {
		const json = await this.httpClient.post<{ subtask: TodoSubtask }>(
			this.baseUrl,
			data,
		);
		return json.subtask;
	}

	async update(subtask: TodoSubtask): Promise<TodoSubtask> {
		const json = await this.httpClient.patch<{ subtask: TodoSubtask }>(
			this.baseUrl,
			{ subtask },
		);
		return json.subtask;
	}

	async delete(id: string): Promise<void> {
		await this.httpClient.delete(`${this.baseUrl}?id=${id}`);
	}

	async reorder(ids: string[]): Promise<void> {
		await this.httpClient.patch(`${this.baseUrl}/reorder`, { ids });
	}

	async moveToPosition(id: string, position: number): Promise<TodoSubtask> {
		const json = await this.httpClient.patch<{ subtask: TodoSubtask }>(
			`${this.baseUrl}/${id}/position`,
			{ position },
		);
		return json.subtask;
	}
}
