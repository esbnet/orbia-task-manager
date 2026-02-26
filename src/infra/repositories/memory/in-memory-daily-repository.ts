import type { Daily } from "@/domain/entities/daily";
import type { DailyRepository } from "@/domain/repositories/all-repository";
import { InMemoryGenericRepository } from "./in-memory-generic-repository";

export class InMemoryDailyRepository
	extends InMemoryGenericRepository<Daily>
	implements DailyRepository
{
	constructor() {
		super();
		this.items = [];
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
		throw new Error("Method not implemented." + position + id);
	}
	findByTags(tags: string[]): Promise<Daily[]> {
		throw new Error("Method not implemented." + tags);
	}
	findByTag(tag: string): Promise<Daily[]> {
		return this.findByTags([tag]);
	}

	async getTagStats(): Promise<Array<{ tag: string; count: number }>> {
		const tagCounts: { [key: string]: number } = {};

		this.items.forEach((daily) => {
			daily.tags.forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		});

		return Object.entries(tagCounts)
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count);
	}
}
