import type { DailySubtask } from "@/domain/entities/daily-subtask";
import type { DailySubtaskRepository } from "@/domain/repositories/all-repository";
import type { HttpClient } from "@/infra/services/http-client";
import { FetchHttpClient } from "@/infra/services/http-client";

export class ApiDailySubtaskRepository implements DailySubtaskRepository {
	private baseUrl = "/api/daily-subtasks";
	private httpClient: HttpClient;

	constructor(httpClient?: HttpClient) {
		this.httpClient = httpClient || new FetchHttpClient();
	}
	findByParentId(parentId: string): Promise<DailySubtask[]> {
		throw new Error("Method not implemented.");
	}
	deleteByParentId(parentId: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	reorderByParentId(parentId: string, ids: string[]): Promise<void> {
		throw new Error("Method not implemented.");
	}
	findById(id: string): Promise<DailySubtask | null> {
		throw new Error("Method not implemented.");
	}
	list(): Promise<DailySubtask[]> {
		throw new Error("Method not implemented.");
	}
	toggleComplete(id: string): Promise<DailySubtask> {
		throw new Error("Method not implemented.");
	}

	async listByDailyId(dailyId: string): Promise<DailySubtask[]> {
		const json = await this.httpClient.get<{ subtasks: DailySubtask[] }>(
			`${this.baseUrl}?dailyId=${dailyId}`,
		);
		return json.subtasks;
	}

	async create(
		data: Omit<DailySubtask, "id" | "createdAt">,
	): Promise<DailySubtask> {
		const json = await this.httpClient.post<{ subtask: DailySubtask }>(
			this.baseUrl,
			data,
		);
		return json.subtask;
	}

	async update(subtask: DailySubtask): Promise<DailySubtask> {
		const json = await this.httpClient.patch<{ subtask: DailySubtask }>(
			this.baseUrl,
			{ subtask },
		);
		return json.subtask;
	}

	async delete(id: string): Promise<void> {
		await this.httpClient.delete(`${this.baseUrl}?id=${id}`);
	}
}
