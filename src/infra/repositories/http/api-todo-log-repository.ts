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
		throw new Error("Method not implemented.");
	}
	findByDateRange(startDate: Date, endDate: Date): Promise<TodoLog[]> {
		throw new Error("Method not implemented.");
	}
	deleteOlderThan(date: Date): Promise<void> {
		throw new Error("Method not implemented.");
	}
	findById(id: string): Promise<TodoLog | null> {
		throw new Error("Method not implemented.");
	}
	list(): Promise<TodoLog[]> {
		throw new Error("Method not implemented.");
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	update(_entity: TodoLog): Promise<TodoLog> {
		throw new Error("Method not implemented.");
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	toggleComplete(_id: string): Promise<TodoLog> {
		throw new Error("Method not implemented.");
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
