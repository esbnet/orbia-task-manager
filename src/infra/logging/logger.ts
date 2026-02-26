/**
 * Níveis de log
 */
export enum LogLevel {
	ERROR = 0,
	WARN = 1,
	INFO = 2,
	DEBUG = 3,
}

/**
 * Interface para entrada de log
 */
export interface LogEntry {
	timestamp: Date;
	level: LogLevel;
	message: string;
	context?: Record<string, any>;
	userId?: string;
	requestId?: string;
	error?: Error;
}

/**
 * Interface para logger
 */
export interface Logger {
	error(message: string, context?: Record<string, any>): void;
	warn(message: string, context?: Record<string, any>): void;
	info(message: string, context?: Record<string, any>): void;
	debug(message: string, context?: Record<string, any>): void;

	setUserId(userId: string): void;
	setRequestId(requestId: string): void;
}

/**
 * Implementação do logger
 */
export class StructuredLogger implements Logger {
	private userId?: string;
	private requestId?: string;
	private minLevel: LogLevel;

	constructor(minLevel: LogLevel = LogLevel.INFO) {
		this.minLevel = minLevel;
	}

	setUserId(userId: string): void {
		this.userId = userId;
	}

	setRequestId(requestId: string): void {
		this.requestId = requestId;
	}

	private shouldLog(level: LogLevel): boolean {
		return level <= this.minLevel;
	}

	private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
		return {
			timestamp: new Date(),
			level,
			message,
			context,
			userId: this.userId,
			requestId: this.requestId,
			error,
		};
	}

	private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
		if (!this.shouldLog(level)) {
			return;
		}

		const entry = this.createLogEntry(level, message, context, error);
		this.writeLog(entry);
	}

	private writeLog(entry: LogEntry): void {
		const levelName = LogLevel[entry.level];
		const timestamp = entry.timestamp.toISOString();

		let logMessage = `[${timestamp}] ${levelName}: ${entry.message}`;

		if (entry.requestId) {
			logMessage += ` [requestId: ${entry.requestId}]`;
		}

		if (entry.userId) {
			logMessage += ` [userId: ${entry.userId}]`;
		}

		if (entry.context) {
			logMessage += ` ${JSON.stringify(entry.context)}`;
		}

		if (entry.error) {
			logMessage += ` Error: ${entry.error.message}\n${entry.error.stack}`;
		}

		// Em produção, isso poderia ser enviado para um serviço de logging
	}

	error(message: string, context?: Record<string, any>): void {
		this.log(LogLevel.ERROR, message, context);
	}

	warn(message: string, context?: Record<string, any>): void {
		this.log(LogLevel.WARN, message, context);
	}

	info(message: string, context?: Record<string, any>): void {
		this.log(LogLevel.INFO, message, context);
	}

	debug(message: string, context?: Record<string, any>): void {
		this.log(LogLevel.DEBUG, message, context);
	}
}

/**
 * Logger singleton
 */
export const logger = new StructuredLogger(
	process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

import { InputSanitizer } from '@/infra/validation/input-sanitizer';

/**
 * Utilitários para logging
 */
export class LoggerUtils {
	static createChildLogger(parentLogger: Logger, context: Record<string, any>): Logger {
		return {
			error: (message: string, ctx?: Record<string, any>) =>
				parentLogger.error(message, { ...context, ...ctx }),
			warn: (message: string, ctx?: Record<string, any>) =>
				parentLogger.warn(message, { ...context, ...ctx }),
			info: (message: string, ctx?: Record<string, any>) =>
				parentLogger.info(message, { ...context, ...ctx }),
			debug: (message: string, ctx?: Record<string, any>) =>
				parentLogger.debug(message, { ...context, ...ctx }),
			setUserId: (userId: string) => parentLogger.setUserId(userId),
			setRequestId: (requestId: string) => parentLogger.setRequestId(requestId),
		};
	}

	static logExecutionTime<T>(
		logger: Logger,
		operation: string,
		fn: () => Promise<T>
	): Promise<T> {
		const startTime = Date.now();
		const safeOperation = InputSanitizer.sanitizeForLog(operation);

		return fn()
			.then((result) => {
				const duration = Date.now() - startTime;
				logger.debug(`Operation completed: ${InputSanitizer.sanitizeForLog(safeOperation)}`, { duration });
				return result;
			})
			.catch((error) => {
				const duration = Date.now() - startTime;
				const safeErrorMessage = InputSanitizer.sanitizeForLog(error?.message || 'Unknown error');
				logger.error(`Operation failed: ${safeOperation}`, { duration, error: safeErrorMessage });
				throw error;
			});
	}
}