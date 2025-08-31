import { BaseDomainValidator } from "../validation/domain-validator";

/**
 * Value Object para UserId
 * Garante que o ID do usuário seja válido e consistente
 */
export class UserId {
	private constructor(private readonly value: string) {}

	static create(value: string): UserId {
		const validator = new UserIdValidator();
		const result = validator.validate(value);

		if (!result.isValid) {
			throw new Error(`Invalid UserId: ${result.errors.join(', ')}`);
		}

		return new UserId(value);
	}

	static fromString(value: string): UserId {
		return new UserId(value);
	}

	getValue(): string {
		return this.value;
	}

	equals(other: UserId): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}
}

class UserIdValidator extends BaseDomainValidator<string> {
	protected validateRules(value: string): void {
		this.isNotEmpty(value, "UserId");

		// UserId deve ter pelo menos 1 caracter e no máximo 50
		if (value) {
			this.isValidLength(value, 1, 50, "UserId");
		}

		// UserId não deve conter caracteres especiais perigosos
		const dangerousChars = /[<>"/\\|?*\x00-\x1f]/;
		if (dangerousChars.test(value)) {
			this.addError("UserId contém caracteres inválidos");
		}
	}
}