import type { GoalMilestone } from "../entities/goal-milestone";
import type { GenericRepository } from "./generic-repository";

export interface GoalMilestoneRepository
	extends GenericRepository<GoalMilestone> {
	findByGoalId(goalId: string): Promise<GoalMilestone[]>;
	findByUserId(userId: string): Promise<GoalMilestone[]>;
	findCompletedByGoalId(goalId: string): Promise<GoalMilestone[]>;
	findPendingByGoalId(goalId: string): Promise<GoalMilestone[]>;
}
