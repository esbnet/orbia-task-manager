import type {
	CategoryRepository,
	PriorityRepository,
	TaggableRepository,
	UserOwnedDateQueryRepository,
	UserOwnedStatusRepository,
} from "./base-repository";

import type { Goal } from "../entities/goal";

// Goal repository with all necessary functionality
export interface GoalRepository
	extends UserOwnedStatusRepository<Goal, Goal["status"]>,
		PriorityRepository<Goal, Goal["priority"]>,
		CategoryRepository<Goal, Goal["category"]>,
		TaggableRepository<Goal>,
		UserOwnedDateQueryRepository<Goal> {
	// Goal-specific methods can be added here if needed
}
