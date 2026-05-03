import { z } from "zod";

// Common schemas
export const idSchema = z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/);

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
	title: z.string().min(1),
	description: z.string().optional().default(""),
	difficulty: z.enum(["Trivial", "Fácil", "Médio", "Difícil"]).optional().default("Fácil"),
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
