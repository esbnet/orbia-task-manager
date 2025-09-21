import type { DailyLog } from "@/domain/entities/daily-log";
import type { DailyLogRepository } from "@/domain/repositories/daily-log-repository";
import type { CreateEntityData } from "@/domain/repositories/base-repository";
import type { HttpClient } from "@/infra/services/http-client";
import { FetchHttpClient } from "@/infra/services/http-client";

export class ApiDailyLogRepository implements DailyLogRepository {
	private baseUrl = "/api/daily-logs";
	private httpClient: HttpClient;

	constructor(httpClient?: HttpClient) {
		this.httpClient = httpClient || new FetchHttpClient();
	}

	async list(): Promise<DailyLog[]> {
		const response = await this.httpClient.get<{ logs: DailyLog[] }>(this.baseUrl);
		return response.logs;
	}

	async findById(id: string): Promise<DailyLog | null> {
		const response = await this.httpClient.get<{ log: DailyLog | null }>(`${this.baseUrl}/${id}`);
		return response.log;
	}

	async create(data: CreateEntityData<DailyLog>): Promise<DailyLog> {
		const json = await this.httpClient.post<{ log: DailyLog }>(
			this.baseUrl,
			data,
		);
		return json.log;
	}

	async update(entity: DailyLog): Promise<DailyLog> {
		const response = await this.httpClient.patch<{ log: DailyLog }>(
			`${this.baseUrl}/${entity.id}`,
			entity
		);
		return response.log;
	}

	async delete(id: string): Promise<void> {
		await this.httpClient.delete(`${this.baseUrl}/${id}`);
	}

	async findByEntityId(entityId: string): Promise<DailyLog[]> {
		const response = await this.httpClient.get<{ logs: DailyLog[] }>(
			`${this.baseUrl}?entityId=${entityId}`
		);
		return response.logs;
	}

	async findByDateRange(startDate: Date, endDate: Date): Promise<DailyLog[]> {
		const response = await this.httpClient.get<{ logs: DailyLog[] }>(
			`${this.baseUrl}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
		);
		return response.logs;
	}

	async deleteOlderThan(date: Date): Promise<void> {
		await this.httpClient.delete(`${this.baseUrl}/older-than?date=${date.toISOString()}`);
	}

	async hasLogForDate(dailyId: string, date: string): Promise<boolean> {
		const response = await this.httpClient.get<{ hasLog: boolean }>(
			`${this.baseUrl}/check?dailyId=${dailyId}&date=${date}`
		);
		return response.hasLog;
	}

	async getLastLogDate(dailyId: string): Promise<Date | null> {
		const response = await this.httpClient.get<{ lastLog: string | null }>(
			`${this.baseUrl}/last?dailyId=${dailyId}`
		);
		return response.lastLog ? new Date(response.lastLog) : null;
	}
}
