export type TodoType = "pontual" | "recorrente";

export class TodoTypeValueObject {
	private constructor(private readonly value: TodoType) {}

	public static PONTUAL: TodoType = "pontual";
	public static RECORRENTE: TodoType = "recorrente";

	public static create(value: TodoType): TodoTypeValueObject {
		if (value !== "pontual" && value !== "recorrente") {
			throw new Error("Tipo de todo inválido. Deve ser 'pontual' ou 'recorrente'");
		}
		return new TodoTypeValueObject(value);
	}

	public static fromRecurrence(recurrence: string): TodoTypeValueObject {
		return recurrence === "none"
			? new TodoTypeValueObject("pontual")
			: new TodoTypeValueObject("recorrente");
	}

	public getValue(): TodoType {
		return this.value;
	}

	public isPontual(): boolean {
		return this.value === "pontual";
	}

	public isRecorrente(): boolean {
		return this.value === "recorrente";
	}

	public toString(): string {
		return this.value;
	}
}