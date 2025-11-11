/**
 * Serviço de sanitização de entrada
 * Camada de infraestrutura para validação e sanitização
 */
export class InputSanitizer {
	/**
	 * Valida e sanitiza um ID
	 */
	static sanitizeId(id: string): string {
		if (!id || typeof id !== 'string') {
			throw new Error('Invalid ID format');
		}

		const sanitized = id.replace(/[^a-zA-Z0-9_-]/g, '');
		
		if (sanitized !== id || sanitized.length === 0) {
			throw new Error('Invalid ID format');
		}

		return sanitized;
	}

	/**
	 * Sanitiza string para logs (remove caracteres de controle)
	 */
	static sanitizeForLog(input: string): string {
		if (typeof input !== 'string') return String(input);
		return input.replace(/[\r\n\t]/g, '');
	}

	/**
	 * Valida e sanitiza campos permitidos de um objeto
	 */
	static sanitizeFields<T extends Record<string, any>>(
		data: T,
		allowedFields: string[]
	): Partial<T> {
		return Object.keys(data)
			.filter(key => allowedFields.includes(key))
			.reduce((obj, key) => {
				obj[key] = data[key];
				return obj;
			}, {} as Partial<T>);
	}

	/**
	 * Valida timeRange para analytics
	 */
	static sanitizeTimeRange(timeRange: string): 'week' | 'month' | 'quarter' | 'year' {
		const validRanges = ['week', 'month', 'quarter', 'year'] as const;
		return validRanges.includes(timeRange as any) ? timeRange as typeof validRanges[number] : 'month';
	}

	/**
	 * Valida URL para prevenir SSRF
	 */
	static sanitizeUrl(url: string): string {
		try {
			const parsedUrl = new URL(url);
			if (url.startsWith('/')) return url;
			if (typeof window !== 'undefined' && parsedUrl.origin === window.location.origin) {
				return url;
			}
			throw new Error('Invalid URL');
		} catch {
			throw new Error('Invalid URL');
		}
	}
}
