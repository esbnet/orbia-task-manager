import type { TodoLog } from "@/domain/entities/todo-log";
import type { TodoLogRepository } from "@/domain/repositories/all-repository";
import type { HttpClient } from "@/infra/services/http-client";
import { FetchHttpClient } from "@/infra/services/http-client";

export class ApiTodoLogRepository implements TodoLogRepository {
	private baseUrl = "/api/todo-logs";
	private httpClient: HttpClient;

	constructor(httpClient?: HttpClient) {
		this.httpClient = httpClient || new FetchHttpClient();
	}
	findByEntityId(entityId: string): Promise<TodoLog[]> {
		throw new Error("Method not implemented." + entityId);
	}
	findByDateRange(startDate: Date, endDate: Date): Promise<TodoLog[]> {
		throw new Error("Method not implemented." + startDate + endDate);
	}
	deleteOlderThan(date: Date): Promise<void> {
		throw new Error("Method not implemented." + date);
	}
	findById(id: string): Promise<TodoLog | null> {
		throw new Error("Method not implemented." + id);
	}
	list(): Promise<TodoLog[]> {
		throw new Error("Method not implemented.");
	}
	update(_entity: TodoLog): Promise<TodoLog> {
		throw new Error("Method not implemented.");
	}
	toggleComplete(_id: string): Promise<TodoLog> {
		throw new Error("Method not implemented.");
	}
	delete(_id: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	async create(data: Omit<TodoLog, "id" | "createdAt">): Promise<TodoLog> {
		const json = await this.httpClient.post<{ log: TodoLog }>(
			this.baseUrl,
			data,
		);
		return json.log;
	}
}
