import type {
	PriorityRepository,
	TaggableRepository,
	UserOwnedDateQueryRepository,
	UserOwnedStatusRepository
} from "./base-repository";

import type { Goal } from "../entities/goal";

// Goal repository with all necessary functionality
export interface GoalRepository
	extends UserOwnedStatusRepository<Goal, Goal["status"]>,
		PriorityRepository<Goal, Goal["priority"]>,
		TaggableRepository<Goal>,
		UserOwnedDateQueryRepository<Goal> {
	// Goal-specific methods can be added here if needed
}
