/**
 * Value Object para IDs de entidades
 * Garante que IDs sejam válidos e seguros
 */
export class EntityId {
	private constructor(private readonly value: string) {}

	static create(id: string): EntityId {
		if (!id || typeof id !== 'string') {
			throw new Error('ID must be a non-empty string');
		}

		const sanitized = id.replace(/[^a-zA-Z0-9_-]/g, '');
		
		if (sanitized !== id) {
			throw new Error('ID contains invalid characters');
		}

		if (sanitized.length === 0) {
			throw new Error('ID cannot be empty after sanitization');
		}

		return new EntityId(sanitized);
	}

	getValue(): string {
		return this.value;
	}

	equals(other: EntityId): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}
}
