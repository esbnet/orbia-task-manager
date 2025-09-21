import type { Todo } from "../entities/todo";
import { BaseDomainValidator } from "./domain-validator";

export class TodoValidator extends BaseDomainValidator<Todo> {
	protected validateRules(entity: Todo): void {
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

		// Validação de tasks
		if (!entity.tasks || entity.tasks.length === 0) {
			this.addError("Todo deve ter pelo menos uma tarefa");
		} else {
			if (entity.tasks.length > 20) {
				this.addError("Todo pode ter no máximo 20 tarefas");
			}

			entity.tasks.forEach((task, index) => {
				if (task.length > 200) {
					this.addError(`Tarefa ${index + 1} deve ter no máximo 200 caracteres`);
				}
				if (task.length < 1) {
					this.addError(`Tarefa ${index + 1} não pode estar vazia`);
				}
			});
		}

		// Validação de dificuldade
		this.isValidEnum(entity.difficulty, {
			"Trivial": "Trivial",
			"Fácil": "Fácil",
			"Médio": "Médio",
			"Difícil": "Difícil"
		}, "Dificuldade");

		// Validação de tags
		if (entity.tags && entity.tags.length > 10) {
			this.addError("Um todo pode ter no máximo 10 tags");
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
		this.isValidDate(entity.startDate, "Data de início");

		// Validação de ordem (se presente)
		if (entity.order !== undefined && (entity.order < 0 || entity.order > 1000)) {
			this.addError("Ordem deve estar entre 0 e 1000");
		}

		// Validação de subtasks (se presentes)
		if (entity.subtasks) {
			if (entity.subtasks.length > 50) {
				this.addError("Todo pode ter no máximo 50 subtasks");
			}

			entity.subtasks.forEach((subtask, index) => {
				if (!subtask.title || subtask.title.trim().length === 0) {
					this.addError(`Subtask ${index + 1} deve ter um título`);
				}
				if (subtask.title && subtask.title.length > 100) {
					this.addError(`Título da subtask ${index + 1} deve ter no máximo 100 caracteres`);
				}
				if (subtask.order < 0 || subtask.order > 1000) {
					this.addError(`Ordem da subtask ${index + 1} deve estar entre 0 e 1000`);
				}
			});
		}
	}
}

// Instância singleton do validador
export const todoValidator = new TodoValidator();