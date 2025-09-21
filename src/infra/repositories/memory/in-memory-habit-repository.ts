import type { Habit, HabitStatus } from "@/domain/entities/habit";

import type { HabitRepository } from "@/domain/repositories/all-repository";
import type { CreateEntityData } from "@/domain/repositories/base-repository";

export class InMemoryHabitRepository implements HabitRepository {
	private habits: Habit[] = [];
	private nextId = 1;

	async list(): Promise<Habit[]> {
		return [...this.habits];
	}

	async findById(id: string): Promise<Habit | null> {
		const habit = this.habits.find(h => h.id === id);
		return habit || null;
	}

	async create(data: CreateEntityData<Habit>): Promise<Habit> {
		const habit: Habit = {
			...data,
			id: this.nextId.toString(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		this.habits.push(habit);
		this.nextId++;
		return habit;
	}

	async update(habit: Habit): Promise<Habit> {
		const index = this.habits.findIndex(h => h.id === habit.id);
		if (index === -1) {
			throw new Error("Habit not found");
		}
		const updatedHabit = { ...habit, updatedAt: new Date() };
		this.habits[index] = updatedHabit;
		return updatedHabit;
	}

	async delete(id: string): Promise<void> {
		const index = this.habits.findIndex(h => h.id === id);
		if (index === -1) {
			throw new Error("Habit not found");
		}
		this.habits.splice(index, 1);
	}

	// UserOwnedRepository methods
	async findByUserId(userId: string): Promise<Habit[]> {
		return this.habits.filter(h => h.userId === userId);
	}

	async deleteByUserId(userId: string): Promise<void> {
		this.habits = this.habits.filter(h => h.userId !== userId);
	}

	// CompletableRepository methods
	async toggleComplete(id: string): Promise<Habit> {
		const habit = await this.findById(id);
		if (!habit) {
			throw new Error("Habit not found");
		}
		const newStatus: HabitStatus = habit.status === "Completo" ? "Em Andamento" : "Completo";
		const updatedHabit = {
			...habit,
			status: newStatus,
			updatedAt: new Date()
		};
		return this.update(updatedHabit);
	}

	async markComplete(id: string): Promise<Habit> {
		const habit = await this.findById(id);
		if (!habit) {
			throw new Error("Habit not found");
		}
		const updatedHabit: Habit = { ...habit, status: "Completo" as HabitStatus, updatedAt: new Date() };
		return this.update(updatedHabit);
	}

	async markIncomplete(id: string): Promise<Habit> {
		const habit = await this.findById(id);
		if (!habit) {
			throw new Error("Habit not found");
		}
		const updatedHabit: Habit = { ...habit, status: "Em Andamento" as HabitStatus, updatedAt: new Date() };
		return this.update(updatedHabit);
	}

	// OrderableRepository methods
	async reorder(ids: string[]): Promise<void> {
		// Simple reordering implementation
		const reorderedHabits: Habit[] = [];
		for (const id of ids) {
			const habit = this.habits.find(h => h.id === id);
			if (habit) {
				reorderedHabits.push({ ...habit, order: reorderedHabits.length });
			}
		}
		this.habits = reorderedHabits;
	}

	async moveToPosition(id: string, position: number): Promise<Habit> {
		const habit = await this.findById(id);
		if (!habit) {
			throw new Error("Habit not found");
		}
		const updatedHabit = { ...habit, order: position, updatedAt: new Date() };
		return this.update(updatedHabit);
	}

	// TaggableRepository methods
	async findByTags(tags: string[]): Promise<Habit[]> {
		return this.habits.filter(habit =>
			tags.some(tag => habit.tags.includes(tag))
		);
	}

	async findByTag(tag: string): Promise<Habit[]> {
		return this.findByTags([tag]);
	}

	async getTagStats(): Promise<Array<{ tag: string; count: number }>> {
		const tagCounts: { [key: string]: number } = {};

		this.habits.forEach((habit) => {
			habit.tags.forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		});

		return Object.entries(tagCounts)
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count);
	}

	// Utility methods for testing
	clear(): void {
		this.habits = [];
		this.nextId = 1;
	}

	getAll(): Habit[] {
		return [...this.habits];
	}

	addHabit(habit: Habit): void {
		this.habits.push(habit);
		if (parseInt(habit.id) >= this.nextId) {
			this.nextId = parseInt(habit.id) + 1;
		}
	}
}