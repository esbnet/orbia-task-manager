import type { Habit, HabitCategory, HabitDifficulty, HabitPriority, HabitReset, HabitStatus } from "../entities/habit";

import { ValidationError } from "../errors/domain-errors";
import { habitValidator } from "../validation/habit-validator";
import { Priority } from "../value-objects/priority";
import { Tag } from "../value-objects/tag";
import { UserId } from "../value-objects/user-id";

/**
 * Dados de entrada para criação de um hábito
 */
export interface CreateHabitData {
	title: string;
	observations?: string;
	difficulty?: HabitDifficulty;
	priority?: HabitPriority;
	category?: HabitCategory;
	tags?: string[];
	reset?: HabitReset;
	userId: string;
}

/**
 * Factory para criação de objetos Habit
 * Encapsula a lógica de criação e validação de hábitos
 */
export class HabitFactory {
	/**
	 * Cria um novo hábito com valores padrão
	 */
	static create(data: CreateHabitData): Habit {
		// Validar dados de entrada
		const validation = habitValidator.validate({
			...data,
			status: "Em Andamento" as HabitStatus,
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Habit);

		if (!validation.isValid) {
			throw new ValidationError(
				`Dados inválidos para criação do hábito: ${validation.errors.join(', ')}`
			);
		}

		// Criar value objects
		const userId = UserId.create(data.userId);
		const tags = data.tags?.map(tag => Tag.create(tag)) || [];
		const priority = Priority.create(data.priority || "Média");

		// Aplicar valores padrão
		const habit: Habit = {
			id: this.generateId(),
			title: data.title.trim(),
			observations: data.observations?.trim() || "",
			difficulty: data.difficulty || "Trivial",
			status: "Em Andamento",
			priority: (data.priority || "Média") as HabitPriority,
			category: data.category || "Pessoa",
			tags: tags.map(tag => tag.getValue()),
			reset: data.reset || "Diariamente",
			userId: userId.getValue(),
			createdAt: new Date(),
			updatedAt: new Date(),
			order: 0,
			currentPeriod: null,
			todayEntries: 0,
		};

		return habit;
	}

	/**
	 * Cria um hábito a partir de dados existentes (ex: do banco)
	 */
	static fromPersistence(data: any): Habit {
		// Validar dados do banco
		const validation = habitValidator.validate(data);
		if (!validation.isValid) {
			throw new ValidationError(
				`Dados inválidos do banco para hábito: ${validation.errors.join(', ')}`
			);
		}

		return data;
	}

	/**
	 * Cria um hábito para testes
	 */
	static createForTest(overrides: Partial<CreateHabitData> = {}): Habit {
		const defaultData: CreateHabitData = {
			title: "Hábito de Teste",
			observations: "Observações de teste",
			difficulty: "Fácil",
			priority: "Média",
			category: "Saúde",
			tags: ["teste"],
			reset: "Diariamente",
			userId: "user-test-123",
			...overrides,
		};

		return this.create(defaultData);
	}

	/**
	 * Gera um ID único para o hábito
	 */
	private static generateId(): string {
		return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Valida se um objeto é um hábito válido
	 */
	static isValidHabit(obj: any): obj is Habit {
		try {
			const validation = habitValidator.validate(obj);
			return validation.isValid;
		} catch {
			return false;
		}
	}
}