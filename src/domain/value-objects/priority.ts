import { BaseDomainValidator } from "../validation/domain-validator";

/**
 * Value Object para Priority
 * Garante que as prioridades sejam válidas e consistentes
 */
export class Priority {
	private constructor(private readonly value: string) {}

	static create(value: string): Priority {
		const validator = new PriorityValidator();
		const result = validator.validate(value);

		if (!result.isValid) {
			throw new Error(`Invalid Priority: ${result.errors.join(', ')}`);
		}

		return new Priority(value);
	}

	static fromString(value: string): Priority {
		return new Priority(value);
	}

	getValue(): string {
		return this.value;
	}

	equals(other: Priority): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}

	/**
	 * Retorna o nível numérico da prioridade (para ordenação)
	 */
	getLevel(): number {
		switch (this.value) {
			case "Baixa": return 1;
			case "Média": return 2;
			case "Alta": return 3;
			case "Urgente": return 4;
			default: return 0;
		}
	}

	/**
	 * Verifica se esta prioridade é maior que outra
	 */
	isHigherThan(other: Priority): boolean {
		return this.getLevel() > other.getLevel();
	}

	/**
	 * Verifica se esta prioridade é menor que outra
	 */
	isLowerThan(other: Priority): boolean {
		return this.getLevel() < other.getLevel();
	}
}

class PriorityValidator extends BaseDomainValidator<string> {
	protected validateRules(value: string): void {
		this.isNotEmpty(value, "Priority");

		// Priority deve ser um dos valores válidos
		const validPriorities = ["Baixa", "Média", "Alta", "Urgente"];
		if (!validPriorities.includes(value)) {
			this.addError(`Priority deve ser um dos valores: ${validPriorities.join(', ')}`);
		}
	}
}