import type { Daily } from "@/domain/entities/daily";
import type { DailyRepository } from "@/domain/repositories/all-repository";
import type { HttpClient } from "@/infra/services/http-client";
import { FetchHttpClient } from "@/infra/services/http-client";

export class ApiDailyRepository implements DailyRepository {
	private baseUrl = "/api/daily";
	private httpClient: HttpClient;

	constructor(httpClient?: HttpClient) {
		this.httpClient = httpClient || new FetchHttpClient();
	}
	findByUserId(userId: string): Promise<Daily[]> {
		throw new Error("Method not implemented." + userId);
	}
	deleteByUserId(userId: string): Promise<void> {
		throw new Error("Method not implemented." + userId);
	}
	findById(id: string): Promise<Daily | null> {
		throw new Error("Method not implemented." + id);
	}
	markComplete(id: string): Promise<Daily> {
		throw new Error("Method not implemented." + id);
	}
	markIncomplete(id: string): Promise<Daily> {
		throw new Error("Method not implemented." + id);
	}
	reorder(ids: string[]): Promise<void> {
		throw new Error("Method not implemented." + ids);
	}
	moveToPosition(id: string, position: number): Promise<Daily> {
		throw new Error("Method not implemented." + position + " " + id);
	}
	findByTags(tags: string[]): Promise<Daily[]> {
		throw new Error("Method not implemented."  + tags);
	}
	findByTag(tag: string): Promise<Daily[]> {
		return this.findByTags([tag]);
	}

	async getTagStats(): Promise<Array<{ tag: string; count: number }>> {
		const json = await this.httpClient.get<{ tagStats: Array<{ tag: string; count: number }> }>(
			`${this.baseUrl}/tags/stats`,
		);
		return json.tagStats || [];
	}

	async list(): Promise<Daily[]> {
		const json = await this.httpClient.get<{ daily: Daily[] }>(
			this.baseUrl,
		);
		return json.daily || [];
	}

	async create(data: Omit<Daily, "id" | "createdAt">): Promise<Daily> {
		const json = await this.httpClient.post<{ daily: Daily }>(
			this.baseUrl,
			data,
		);
		return json.daily;
	}

	async update(daily: Daily): Promise<Daily> {
		const json = await this.httpClient.patch<{ daily: Daily }>(
			this.baseUrl,
			{ daily },
		);
		return json.daily;
	}

	async toggleComplete(id: string): Promise<Daily> {
		await this.httpClient.patch(this.baseUrl, { id });
		const daily = (await this.list()).find((t) => t.id === id);
		if (!daily) throw new Error(`Daily with id ${id} not found`);
		return daily;
	}

	async delete(id: string): Promise<void> {
		await this.httpClient.delete(`/api/dailies/${id}`);
	}
}
