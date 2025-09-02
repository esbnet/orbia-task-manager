export class ErrorHandler {
	static handle(error: unknown): string {
		if (error instanceof Error) {
			return error.message;
		}

		if (typeof error === "string") {
			return error;
		}

		return "An unexpected error occurred";
	}

	static logError(error: unknown, context?: string): void {
		const message = this.handle(error);
	}
}
