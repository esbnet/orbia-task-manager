import type { BaseEntity, BaseFormData, EntityService } from "@/contexts/base/entity-context-factory";

// Generic repository interface
export interface GenericRepository<T extends BaseEntity> {
	list(): Promise<T[]>;
	create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
	update(entity: T): Promise<T>;
	delete(id: string): Promise<void>;
}

// Base entity service implementation
export abstract class BaseEntityService<TEntity extends BaseEntity, TFormData extends BaseFormData>
	implements EntityService<TEntity, TFormData>
{
	constructor(protected repository: GenericRepository<TEntity>) {}

	async list(): Promise<TEntity[]> {
		return this.repository.list();
	}

	async create(data: TFormData): Promise<TEntity> {
		const entityData = this.mapFormDataToEntity(data);
		return this.repository.create(entityData);
	}

	async update(id: string, data: Partial<TEntity>): Promise<TEntity> {
		// Get current entity
		const entities = await this.repository.list();
		const currentEntity = entities.find((e) => e.id === id);
		if (!currentEntity) {
			throw new Error("Entity not found");
		}

		// Merge data
		const updatedEntity = { ...currentEntity, ...data, updatedAt: new Date() };
		return this.repository.update(updatedEntity);
	}

	async delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}

	// Abstract method to be implemented by concrete services
	protected abstract mapFormDataToEntity(data: TFormData): Omit<TEntity, "id" | "createdAt" | "updatedAt">;
}

// Error handling utility
export class ServiceError extends Error {
	constructor(
		message: string,
		public code: string,
		public originalError?: unknown
	) {
		super(message);
		this.name = "ServiceError";
	}
}

// Service error handler
export function handleServiceError(error: unknown, operation: string): never {
	if (error instanceof ServiceError) {
		throw error;
	}

	if (error instanceof Error) {
		throw new ServiceError(
			`Erro durante ${operation}: ${error.message}`,
			"OPERATION_ERROR",
			error
		);
	}

	throw new ServiceError(
		`Erro desconhecido durante ${operation}`,
		"UNKNOWN_ERROR",
		error
	);
}
