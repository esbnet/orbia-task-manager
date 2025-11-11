import { z } from "zod";

// Common schemas
export const idSchema = z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/);

// Daily schemas
export const createDailySchema = z.object({
	userId: z.string().min(1),
	title: z.string().min(1),
	observations: z.string().optional().default(""),
	tasks: z.array(z.string()).optional().default([]),
	difficulty: z.enum(["Trivial", "Fácil", "Médio", "Difícil"]).optional().default("Fácil"),
	repeat: z.object({
		type: z.enum(["Diariamente", "Semanalmente", "Mensalmente"]),
		frequency: z.number().optional().default(1),
	}).optional(),
	tags: z.array(z.string()).optional().default([]),
});

export const updateDailySchema = z.object({
	daily: z.object({
		id: idSchema,
		title: z.string().min(1).optional(),
		observations: z.string().optional(),
		tasks: z.array(z.string()).optional(),
		difficulty: z.enum(["Trivial", "Fácil", "Médio", "Difícil"]).optional(),
		repeat: z.object({
			type: z.enum(["Diariamente", "Semanalmente", "Mensalmente"]),
			frequency: z.number().optional(),
		}).optional(),
		tags: z.array(z.string()).optional(),
	}),
});

// Todo schemas
export const createTodoSchema = z.object({
	userId: z.string().min(1),
	title: z.string().min(1),
	observations: z.string().optional().default(""),
	tasks: z.array(z.string()).optional().default([]),
	difficulty: z.enum(["Trivial", "Fácil", "Médio", "Difícil"]).optional().default("Fácil"),
	recurrence: z.enum(["none", "daily", "weekly", "monthly", "custom"]).optional().default("none"),
	recurrenceInterval: z.number().optional(),
	tags: z.array(z.string()).optional().default([]),
});

// Habit schemas
export const createHabitSchema = z.object({
	userId: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional().default(""),
	difficulty: z.enum(["Trivial", "Fácil", "Médio", "Difícil"]).optional().default("Fácil"),
	resetType: z.enum(["daily", "weekly", "monthly"]).optional().default("daily"),
	tags: z.array(z.string()).optional().default([]),
});

// Goal schemas
export const createGoalSchema = z.object({
	userId: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional().default(""),
	targetDate: z.string().datetime().optional(),
	status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional().default("pending"),
	tags: z.array(z.string()).optional().default([]),
});
