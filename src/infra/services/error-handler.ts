// Centralized Error Handling System


// Error types
export enum ErrorType {
	VALIDATION = "VALIDATION",
	NETWORK = "NETWORK",
	AUTHENTICATION = "AUTHENTICATION",
	AUTHORIZATION = "AUTHORIZATION",
	NOT_FOUND = "NOT_FOUND",
	CONFLICT = "CONFLICT",
	SERVER = "SERVER",
	UNKNOWN = "UNKNOWN",
}

// Custom error class
export class AppError extends Error {
	constructor(
		message: string,
		public type: ErrorType,
		public code?: string,
		public details?: unknown,
		public originalError?: unknown
	) {
		super(message);
		this.name = "AppError";
	}
}

// Error context for better debugging
export interface ErrorContext {
	operation: string;
	entity?: string;
	userId?: string;
	timestamp: Date;
	metadata?: Record<string, unknown>;
}

// Error handler class
export class ErrorHandler {
	private static logError(error: AppError, context: ErrorContext): void {
		const logData = {
			error: {
				message: error.message,
				type: error.type,
				code: error.code,
				stack: error.stack,
			},
			context,
			originalError: error.originalError,
		};

		// In development, log to console
		if (process.env.NODE_ENV === "development") {
		}

		// In production, you would send to logging service
		// Example: sendToLoggingService(logData);
	}

	// Handle and transform errors
	static handle(error: unknown, context: ErrorContext): AppError {
		let appError: AppError;

		if (error instanceof AppError) {
			appError = error;
		} else if (error instanceof Error) {
			appError = this.transformError(error);
		} else {
			appError = new AppError(
				"Erro desconhecido",
				ErrorType.UNKNOWN,
				"UNKNOWN_ERROR",
				undefined,
				error
			);
		}

		this.logError(appError, context);
		return appError;
	}

	// Transform common errors to AppError
	private static transformError(error: Error): AppError {
		// Network errors
		if (error.message.includes("fetch") || error.message.includes("network")) {
			return new AppError(
				"Erro de conexão. Verifique sua internet.",
				ErrorType.NETWORK,
				"NETWORK_ERROR",
				undefined,
				error
			);
		}

		// Authentication errors
		if (error.message.includes("unauthorized") || error.message.includes("401")) {
			return new AppError(
				"Sessão expirada. Faça login novamente.",
				ErrorType.AUTHENTICATION,
				"AUTH_ERROR",
				undefined,
				error
			);
		}

		// Authorization errors
		if (error.message.includes("forbidden") || error.message.includes("403")) {
			return new AppError(
				"Você não tem permissão para esta ação.",
				ErrorType.AUTHORIZATION,
				"PERMISSION_ERROR",
				undefined,
				error
			);
		}

		// Not found errors
		if (error.message.includes("not found") || error.message.includes("404")) {
			return new AppError(
				"Recurso não encontrado.",
				ErrorType.NOT_FOUND,
				"NOT_FOUND_ERROR",
				undefined,
				error
			);
		}

		// Conflict errors
		if (error.message.includes("conflict") || error.message.includes("409")) {
			return new AppError(
				"Conflito de dados. O recurso já existe ou foi modificado.",
				ErrorType.CONFLICT,
				"CONFLICT_ERROR",
				undefined,
				error
			);
		}

		// Server errors
		if (error.message.includes("500") || error.message.includes("server")) {
			return new AppError(
				"Erro interno do servidor. Tente novamente mais tarde.",
				ErrorType.SERVER,
				"SERVER_ERROR",
				undefined,
				error
			);
		}

		// Default transformation
		return new AppError(
			error.message || "Erro inesperado",
			ErrorType.UNKNOWN,
			"GENERIC_ERROR",
			undefined,
			error
		);
	}

	// Get user-friendly message
	static getUserMessage(error: AppError): string {
		switch (error.type) {
			case ErrorType.VALIDATION:
				return error.message || "Dados inválidos. Verifique os campos.";
			case ErrorType.NETWORK:
				return "Problema de conexão. Verifique sua internet.";
			case ErrorType.AUTHENTICATION:
				return "Sessão expirada. Faça login novamente.";
			case ErrorType.AUTHORIZATION:
				return "Você não tem permissão para esta ação.";
			case ErrorType.NOT_FOUND:
				return "Item não encontrado.";
			case ErrorType.CONFLICT:
				return "Conflito de dados. Tente novamente.";
			case ErrorType.SERVER:
				return "Erro do servidor. Tente novamente mais tarde.";
			default:
				return "Algo deu errado. Tente novamente.";
		}
	}

	// Create validation error
	static validation(message: string, field?: string): AppError {
		return new AppError(
			message,
			ErrorType.VALIDATION,
			"VALIDATION_ERROR",
			{ field }
		);
	}

	// Create network error
	static network(message?: string): AppError {
		return new AppError(
			message || "Erro de conexão",
			ErrorType.NETWORK,
			"NETWORK_ERROR"
		);
	}

	// Create not found error
	static notFound(resource: string): AppError {
		return new AppError(
			`${resource} não encontrado`,
			ErrorType.NOT_FOUND,
			"NOT_FOUND_ERROR",
			{ resource }
		);
	}
}

// Utility functions for common error scenarios
export const createErrorContext = (
	operation: string,
	entity?: string,
	metadata?: Record<string, unknown>
): ErrorContext => ({
	operation,
	entity,
	timestamp: new Date(),
	metadata,
});

// Hook for error handling in React components
export const useErrorHandler = () => {
	const handleError = (error: unknown, operation: string, entity?: string) => {
		const context = createErrorContext(operation, entity);
		const appError = ErrorHandler.handle(error, context);
		return ErrorHandler.getUserMessage(appError);
	};

	return { handleError };
};
