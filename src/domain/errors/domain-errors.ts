/**
 * Classe base para todos os erros de domínio
 */
export abstract class DomainError extends Error {
	constructor(message: string, public readonly code: string) {
		super(message);
		this.name = this.constructor.name;
	}
}

/**
 * Erro de validação de domínio
 */
export class ValidationError extends DomainError {
	constructor(message: string, public readonly field?: string) {
		super(message, 'VALIDATION_ERROR');
	}
}

/**
 * Erro de entidade não encontrada
 */
export class NotFoundError extends DomainError {
	constructor(resource: string, identifier: string) {
		super(`${resource} with identifier '${identifier}' not found`, 'NOT_FOUND_ERROR');
	}
}

/**
 * Erro de conflito de negócio
 */
export class ConflictError extends DomainError {
	constructor(message: string) {
		super(message, 'CONFLICT_ERROR');
	}
}

/**
 * Erro de autorização
 */
export class UnauthorizedError extends DomainError {
	constructor(message: string = 'Unauthorized access') {
		super(message, 'UNAUTHORIZED_ERROR');
	}
}

/**
 * Erro de operação inválida
 */
export class InvalidOperationError extends DomainError {
	constructor(message: string) {
		super(message, 'INVALID_OPERATION_ERROR');
	}
}

/**
 * Erro de infraestrutura
 */
export class InfrastructureError extends DomainError {
	constructor(message: string, public readonly originalError?: Error) {
		super(message, 'INFRASTRUCTURE_ERROR');
	}
}

/**
 * Função utilitária para verificar se um erro é do domínio
 */
export function isDomainError(error: unknown): error is DomainError {
	return error instanceof DomainError;
}

/**
 * Função utilitária para extrair código de erro
 */
export function getErrorCode(error: unknown): string {
	if (isDomainError(error)) {
		return error.code;
	}
	return 'UNKNOWN_ERROR';
}

/**
 * Função utilitária para criar resposta de erro padronizada
 */
export interface ErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		field?: string;
	};
}

export function createErrorResponse(error: unknown): ErrorResponse {
	if (isDomainError(error)) {
		return {
			success: false,
			error: {
				code: error.code,
				message: error.message,
				field: error instanceof ValidationError ? error.field : undefined,
			},
		};
	}

	return {
		success: false,
		error: {
			code: 'UNKNOWN_ERROR',
			message: error instanceof Error ? error.message : 'An unknown error occurred',
		},
	};
}