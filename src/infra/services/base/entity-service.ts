// Base entity interface
export interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt?: Date;
}

// Base form data interface
export interface BaseFormData {
	[key: string]: any;
}

// Entity service interface
export interface EntityService<TEntity extends BaseEntity, TFormData extends BaseFormData> {
	list(): Promise<TEntity[]>;
	create(data: TFormData): Promise<TEntity>;
	update(id: string, data: Partial<TEntity>): Promise<TEntity>;
	delete(id: string): Promise<void>;
}

// Generic repository interface
export interface GenericRepository<T extends BaseEntity> {
	list(): Promise<T[]>;
	findById?(id: string): Promise<T | null>;
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
		// Prefer direct lookup when the repository supports it; fallback to list for legacy repos.
		const currentEntity = typeof this.repository.findById === "function"
			? await this.repository.findById(id)
			: (await this.repository.list()).find((e) => e.id === id) ?? null;
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
