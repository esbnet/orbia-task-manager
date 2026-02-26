import { CompleteDailyUseCase } from "@/application/use-cases/daily/complete-daily/complete-daily-use-case";
import type { DailyLogRepository } from "@/domain/repositories/all-repository";
import type { DailyLog } from "@/domain/entities/daily-log";

class InMemoryDailyLogRepository implements DailyLogRepository {
	private logs: DailyLog[] = [];

	async create(data: Omit<DailyLog, "id" | "createdAt">): Promise<DailyLog> {
		const log: DailyLog = {
			...data,
			id: Math.random().toString(),
			createdAt: new Date(),
			periodId: data.periodId,
		};
		this.logs.push(log);
		return log;
	}

	async list(): Promise<DailyLog[]> { return this.logs; }
	async findById(id: string): Promise<DailyLog | null> { return this.logs.find(l => l.id === id) || null; }
	async update(log: DailyLog): Promise<DailyLog> { return log; }
	async delete(id: string): Promise<void> { this.logs = this.logs.filter(l => l.id !== id); }
	async toggleComplete(): Promise<DailyLog> { throw new Error("Not implemented"); }
	async hasLogForDate(): Promise<boolean> { return false; }
	async getLastLogDate(): Promise<Date | null> { return null; }
	async findByEntityId(): Promise<DailyLog[]> { return []; }
	async findByDateRange(): Promise<DailyLog[]> { return []; }
	async deleteOlderThan(): Promise<void> { }
}

describe("CompleteDailyUseCase", () => {
	let useCase: CompleteDailyUseCase;
	let logRepository: InMemoryDailyLogRepository;

	beforeEach(() => {
		logRepository = new InMemoryDailyLogRepository();
		useCase = new CompleteDailyUseCase(logRepository);
	});

	it("deve criar log de conclusão", async () => {
		const daily = {
			id: "1",
			title: "Test Daily",
			difficulty: "Fácil",
			tags: ["test"],
		} as any;

		const result = await useCase.execute({ daily });

		expect(result.success).toBe(true);
		expect(result.logId).toBeDefined();
	});
});
