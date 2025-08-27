import type { Habit } from "@/domain/entities/habit";
import type { HabitRepository } from "@/domain/repositories/all-repository";
import type { CreateEntityData } from "@/domain/repositories/base-repository";
import type { HttpClient } from "@/infra/services/http-client";
import { FetchHttpClient } from "@/infra/services/http-client";

export class ApiHabitRepository implements HabitRepository {
	private baseUrl = "/api/habits";
	private httpClient: HttpClient;

	constructor(httpClient?: HttpClient) {
		this.httpClient = httpClient || new FetchHttpClient();
	}

	async list(): Promise<Habit[]> {
		const json = await this.httpClient.get<{ habits: Habit[] }>(
			this.baseUrl,
		);
		return json.habits || [];
	}

	async create(data: CreateEntityData<Habit>): Promise<Habit> {
		const json = await this.httpClient.post<{ habit: Habit }>(
			this.baseUrl,
			data,
		);
		return json.habit;
	}

	async update(habit: Habit): Promise<Habit> {
		const json = await this.httpClient.patch<{ habit: Habit }>(
			this.baseUrl,
			{ habit },
		);
		return json.habit;
	}

	async toggleComplete(id: string): Promise<Habit> {
		await this.httpClient.patch(this.baseUrl, { id });
		return (await this.list()).find((t) => t.id === id)!;
	}

	async delete(id: string): Promise<void> {
		await this.httpClient.delete(`${this.baseUrl}?id=${id}`);
	}

	// UserOwnedRepository methods
	async findByUserId(userId: string): Promise<Habit[]> {
		const json = await this.httpClient.get<{ habits: Habit[] }>(
			`${this.baseUrl}?userId=${userId}`,
		);
		return json.habits || [];
	}

	async deleteByUserId(userId: string): Promise<void> {
		await this.httpClient.delete(`${this.baseUrl}?userId=${userId}`);
	}

	// BaseRepository methods
	async findById(id: string): Promise<Habit | null> {
		try {
			const json = await this.httpClient.get<{ habit: Habit }>(
				`${this.baseUrl}/${id}`,
			);
			return json.habit;
		} catch {
			return null;
		}
	}

	// CompletableRepository methods
	async markComplete(id: string): Promise<Habit> {
		const json = await this.httpClient.patch<{ habit: Habit }>(
			`${this.baseUrl}/${id}/complete`,
			{},
		);
		return json.habit;
	}

	async markIncomplete(id: string): Promise<Habit> {
		const json = await this.httpClient.patch<{ habit: Habit }>(
			`${this.baseUrl}/${id}/incomplete`,
			{},
		);
		return json.habit;
	}

	// OrderableRepository methods
	async reorder(ids: string[]): Promise<void> {
		await this.httpClient.patch(`${this.baseUrl}/reorder`, { ids });
	}

	async moveToPosition(id: string, position: number): Promise<Habit> {
		const json = await this.httpClient.patch<{ habit: Habit }>(
			`${this.baseUrl}/${id}/position`,
			{ position },
		);
		return json.habit;
	}

	// TaggableRepository methods
	async findByTags(tags: string[]): Promise<Habit[]> {
		const json = await this.httpClient.get<{ habits: Habit[] }>(
			`${this.baseUrl}?tags=${tags.join(",")}`,
		);
		return json.habits || [];
	}

	async findByTag(tag: string): Promise<Habit[]> {
		return this.findByTags([tag]);
	}
}
