// Base repository interfaces with clear hierarchy

// Base entity interface
export interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt?: Date;
}

// Entity with user ownership
export interface UserOwnedEntity extends BaseEntity {
	userId: string;
}

// Create data type helper
export type CreateEntityData<T extends BaseEntity> = Omit<T, "id" | "createdAt" | "updatedAt">;

// Base repository interface
export interface BaseRepository<T extends BaseEntity> {
	list(): Promise<T[]>;
	findById(id: string): Promise<T | null>;
	create(data: CreateEntityData<T>): Promise<T>;
	update(entity: T): Promise<T>;
	delete(id: string): Promise<void>;
}

// Repository for user-owned entities
export interface UserOwnedRepository<T extends UserOwnedEntity> extends BaseRepository<T> {
	findByUserId(userId: string): Promise<T[]>;
	deleteByUserId(userId: string): Promise<void>;
}

// Repository with completion functionality
export interface CompletableRepository<T extends BaseEntity> extends BaseRepository<T> {
	toggleComplete(id: string): Promise<T>;
	markComplete(id: string): Promise<T>;
	markIncomplete(id: string): Promise<T>;
}

// Repository with ordering functionality
export interface OrderableRepository<T extends BaseEntity> extends BaseRepository<T> {
	reorder(ids: string[]): Promise<void>;
	moveToPosition(id: string, position: number): Promise<T>;
}

// Repository with tagging functionality
export interface TaggableRepository<T extends BaseEntity> extends BaseRepository<T> {
	findByTags(tags: string[]): Promise<T[]>;
	findByTag(tag: string): Promise<T[]>;
}

// Repository with status functionality
export interface StatusRepository<T extends BaseEntity, TStatus = string> extends BaseRepository<T> {
	findByStatus(status: TStatus): Promise<T[]>;
	updateStatus(id: string, status: TStatus): Promise<T>;
}

// Repository with user-owned status functionality
export interface UserOwnedStatusRepository<T extends UserOwnedEntity, TStatus = string> 
	extends UserOwnedRepository<T>, StatusRepository<T, TStatus> {
	findByUserIdAndStatus(userId: string, status: TStatus): Promise<T[]>;
}

// Repository with priority functionality
export interface PriorityRepository<T extends BaseEntity, TPriority = string> extends BaseRepository<T> {
	findByPriority(priority: TPriority): Promise<T[]>;
	updatePriority(id: string, priority: TPriority): Promise<T>;
}

// Repository with category functionality
export interface CategoryRepository<T extends BaseEntity, TCategory = string> extends BaseRepository<T> {
	findByCategory(category: TCategory): Promise<T[]>;
	updateCategory(id: string, category: TCategory): Promise<T>;
}

// Repository with date-based queries
export interface DateQueryRepository<T extends BaseEntity> extends BaseRepository<T> {
	findByDateRange(startDate: Date, endDate: Date): Promise<T[]>;
	findOverdue(): Promise<T[]>;
	findDueSoon(days: number): Promise<T[]>;
}

// Repository with user-owned date queries
export interface UserOwnedDateQueryRepository<T extends UserOwnedEntity> 
	extends UserOwnedRepository<T>, DateQueryRepository<T> {
	findOverdueByUserId(userId: string): Promise<T[]>;
	findDueSoonByUserId(userId: string, days: number): Promise<T[]>;
}

// Subtask repository interface
export interface SubtaskRepository<T extends BaseEntity> extends BaseRepository<T> {
	findByParentId(parentId: string): Promise<T[]>;
	deleteByParentId(parentId: string): Promise<void>;
	reorderByParentId(parentId: string, ids: string[]): Promise<void>;
}

// Log repository interface
export interface LogRepository<T extends BaseEntity> extends BaseRepository<T> {
	findByEntityId(entityId: string): Promise<T[]>;
	findByDateRange(startDate: Date, endDate: Date): Promise<T[]>;
	deleteOlderThan(date: Date): Promise<void>;
}
