/**
 * Resultado da validação
 */
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

/**
 * Interface para validadores de domínio
 */
export interface DomainValidator<T> {
	validate(entity: T): ValidationResult;
}

/**
 * Classe base para validação de domínio
 */
export abstract class BaseDomainValidator<T> implements DomainValidator<T> {
	protected errors: string[] = [];

	validate(entity: T): ValidationResult {
		this.errors = [];
		this.validateRules(entity);

		return {
			isValid: this.errors.length === 0,
			errors: [...this.errors]
		};
	}

	protected abstract validateRules(entity: T): void;

	protected addError(message: string): void {
		this.errors.push(message);
	}

	protected isNotEmpty(value: string | undefined | null, fieldName: string): boolean {
		if (!value || value.trim().length === 0) {
			this.addError(`${fieldName} não pode estar vazio`);
			return false;
		}
		return true;
	}

	protected isValidLength(value: string, min: number, max: number, fieldName: string): boolean {
		if (value.length < min) {
			this.addError(`${fieldName} deve ter pelo menos ${min} caracteres`);
			return false;
		}
		if (value.length > max) {
			this.addError(`${fieldName} deve ter no máximo ${max} caracteres`);
			return false;
		}
		return true;
	}

	protected isValidEnum<T extends Record<string, string | number>>(
		value: string,
		validValues: T,
		fieldName: string
	): boolean {
		const enumValues = Object.values(validValues);
		if (!enumValues.includes(value as T[keyof T])) {
			this.addError(`${fieldName} deve ser um dos valores: ${enumValues.join(', ')}`);
			return false;
		}
		return true;
	}

	protected isValidDate(value: Date, fieldName: string): boolean {
		if (!(value instanceof Date) || isNaN(value.getTime())) {
			this.addError(`${fieldName} deve ser uma data válida`);
			return false;
		}
		return true;
	}

	protected isFutureDate(value: Date, fieldName: string): boolean {
		if (value <= new Date()) {
			this.addError(`${fieldName} deve ser uma data futura`);
			return false;
		}
		return true;
	}
}