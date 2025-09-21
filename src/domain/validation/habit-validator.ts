import type { Habit, HabitDifficulty, HabitPriority, HabitReset, HabitStatus } from "../entities/habit";

import { BaseDomainValidator } from "./domain-validator";

export class HabitValidator extends BaseDomainValidator<Habit> {
	protected validateRules(entity: Habit): void {
		// Validações básicas
		this.isNotEmpty(entity.title, "Título");
		this.isNotEmpty(entity.userId, "ID do usuário");

		// Validação de comprimento do título
		if (entity.title) {
			this.isValidLength(entity.title, 1, 100, "Título");
		}

		// Validação de observações (opcional, mas se presente, tem limite)
		if (entity.observations && entity.observations.length > 500) {
			this.addError("Observações devem ter no máximo 500 caracteres");
		}

		// Validação de enums
		this.isValidEnum(entity.difficulty, {
			"Trivial": "Trivial",
			"Fácil": "Fácil",
			"Médio": "Médio",
			"Difícil": "Difícil"
		} as Record<string, HabitDifficulty>, "Dificuldade");

		this.isValidEnum(entity.status, {
			"Em Andamento": "Em Andamento",
			"Completo": "Completo",
			"Cancelado": "Cancelado"
		} as Record<string, HabitStatus>, "Status");

		this.isValidEnum(entity.priority, {
			"Baixa": "Baixa",
			"Média": "Média",
			"Alta": "Alta",
			"Urgente": "Urgente"
		} as Record<string, HabitPriority>, "Prioridade");

		this.isValidEnum(entity.reset, {
			"Diariamente": "Diariamente",
			"Semanalmente": "Semanalmente",
			"Mensalmente": "Mensalmente"
		} as Record<string, HabitReset>, "Reset");

		// Validação de tags
		if (entity.tags && entity.tags.length > 10) {
			this.addError("Um hábito pode ter no máximo 10 tags");
		}

		if (entity.tags) {
			entity.tags.forEach((tag, index) => {
				if (tag.length > 30) {
					this.addError(`Tag ${index + 1} deve ter no máximo 30 caracteres`);
				}
				if (tag.length < 1) {
					this.addError(`Tag ${index + 1} não pode estar vazia`);
				}
			});
		}

		// Validação de datas
		this.isValidDate(entity.createdAt, "Data de criação");

		// Validação de ordem (se presente)
		if (entity.order !== undefined && (entity.order < 0 || entity.order > 1000)) {
			this.addError("Ordem deve estar entre 0 e 1000");
		}
	}
}

// Instância singleton do validador
export const habitValidator = new HabitValidator();