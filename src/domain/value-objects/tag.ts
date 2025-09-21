import { BaseDomainValidator } from "../validation/domain-validator";

/**
 * Value Object para Tag
 * Garante que as tags sejam válidas e consistentes
 */
export class Tag {
	private constructor(private readonly value: string) {}

	static create(value: string): Tag {
		const validator = new TagValidator();
		const result = validator.validate(value);

		if (!result.isValid) {
			throw new Error(`Invalid Tag: ${result.errors.join(', ')}`);
		}

		return new Tag(value.toLowerCase().trim());
	}

	static fromString(value: string): Tag {
		return new Tag(value);
	}

	getValue(): string {
		return this.value;
	}

	equals(other: Tag): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}

	/**
	 * Retorna a tag com a primeira letra maiúscula para display
	 */
	toDisplayString(): string {
		return this.value.charAt(0).toUpperCase() + this.value.slice(1);
	}
}

class TagValidator extends BaseDomainValidator<string> {
	protected validateRules(value: string): void {
		this.isNotEmpty(value, "Tag");

		// Tag deve ter pelo menos 1 caracter e no máximo 30
		if (value) {
			this.isValidLength(value, 1, 30, "Tag");
		}

		// Tag não deve conter caracteres especiais perigosos
		const dangerousChars = /[<>"/\\|?*\x00-\x1f]/;
		if (dangerousChars.test(value)) {
			this.addError("Tag contém caracteres inválidos");
		}

		// Tag não deve conter espaços
		if (value.includes(' ')) {
			this.addError("Tag não pode conter espaços");
		}

		// Tag deve conter apenas letras, números e hífens
		const validPattern = /^[a-zA-Z0-9\-]+$/;
		if (!validPattern.test(value)) {
			this.addError("Tag deve conter apenas letras, números e hífens");
		}
	}
}