"use client";

import { GoalColumn } from "@/components/goal/goal-column";
import { HabitColumn } from "@/components/habit/habit-column";
import { TodoColumn } from "@/components/todo/todo-column";
import { HabitProvider } from "@/contexts/habit-context-refactored";
import { TagsProvider } from "@/contexts/tags-context";
import { TodoStateProvider } from "@/contexts/todo-state-context";
import { TodoSubtaskProvider } from "@/contexts/todo-subtask-context";

interface ClientProvidersProps {
	columnFilter?: "all" | "habits" | "todos" | "goals";
}

export function ClientProviders({ columnFilter = "all" }: ClientProvidersProps) {
	const getGridCols = () => {
		if (columnFilter === "all") return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
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
				{(columnFilter === "all" || columnFilter === "todos") && (
					<TodoStateProvider>
						<TodoSubtaskProvider>
							<TodoColumn />
						</TodoSubtaskProvider>
					</TodoStateProvider>
				)}
				{(columnFilter === "all" || columnFilter === "goals") && (
					<GoalColumn />
				)}
			</div>
		</TagsProvider>
	);
}
