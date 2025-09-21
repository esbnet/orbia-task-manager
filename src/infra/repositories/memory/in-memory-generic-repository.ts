import type {
	BaseEntity,
	CreateEntityData,
	GenericRepository,
} from "@/domain/repositories/generic-repository";

export abstract class InMemoryGenericRepository<T extends BaseEntity>
	implements GenericRepository<T>
{
	protected items: T[] = [];

	async list(): Promise<T[]> {
		return [...this.items];
	}

	async create(data: CreateEntityData<T>): Promise<T> {
		const newItem: T = {
			id: Math.random().toString(36).substring(7),
			...data,
			createdAt: new Date(),
		} as T;

		this.items.push(newItem);
		return newItem;
	}

	async update(entity: T): Promise<T> {
		const index = this.items.findIndex((item) => item.id === entity.id);
		if (index < 0) throw new Error("Entity not found");

		this.items[index] = entity;
		return entity;
	}

	async toggleComplete(id: string): Promise<T> {
		const index = this.items.findIndex((item) => item.id === id);
		if (index < 0) throw new Error("Entity not found");

		const item = this.items[index];
		(item as { completed?: boolean }).completed = !(
			item as { completed?: boolean }
		).completed;

		this.items[index] = item;
		return item;
	}

	async delete(id: string): Promise<void> {
		this.items = this.items.filter((item) => item.id !== id);
	}
}
