"use client";

import { DailyColumn } from "@/components/daily/daily-column";
import { GoalColumn } from "@/components/goal/goal-column";
import { HabitColumn } from "@/components/habit/habit-column";
import { TodoColumn } from "@/components/todo/todo-column";
import { DailyProvider } from "@/contexts/daily-context";
import { DailySubtaskProvider } from "@/contexts/daily-subtask-context";
import { HabitProvider } from "@/contexts/habit-context-refactored";
import { TagsProvider } from "@/contexts/tags-context";
// TodoProvider removido - usando React Query
import { TodoSubtaskProvider } from "@/contexts/todo-subtask-context";

interface ClientProvidersProps {
	columnFilter?: "all" | "habits" | "dailies" | "todos" | "goals";
}

export function ClientProviders({ columnFilter = "all" }: ClientProvidersProps) {
	const getGridCols = () => {
		if (columnFilter === "all") return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
		return "grid-cols-1";
	};

	return (
		<TagsProvider>
			<div className={`gap-4 grid ${getGridCols()} auto-cols-max h-full`}>
				{(columnFilter === "all" || columnFilter === "habits") && (
					<HabitProvider>
						<HabitColumn />
					</HabitProvider>
				)}
				{(columnFilter === "all" || columnFilter === "dailies") && (
					<DailyProvider>
						<DailySubtaskProvider>
							<DailyColumn />
						</DailySubtaskProvider>
					</DailyProvider>
				)}
				{(columnFilter === "all" || columnFilter === "todos") && (
					<TodoSubtaskProvider>
						<TodoColumn />
					</TodoSubtaskProvider>
				)}
				{(columnFilter === "all" || columnFilter === "goals") && (
					<GoalColumn />
				)}
			</div>
		</TagsProvider>
	);
}
