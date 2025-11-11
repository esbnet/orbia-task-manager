import { InputSanitizer } from '@/infra/validation/input-sanitizer';

export interface HttpClient {
	get<T>(url: string): Promise<T>;
	post<T>(url: string, data: unknown): Promise<T>;
	patch<T>(url: string, data: unknown): Promise<T>;
	delete(url: string): Promise<void>;
}

export class FetchHttpClient implements HttpClient {
	async get<T>(url: string): Promise<T> {
		const validUrl = InputSanitizer.sanitizeUrl(url);
		const response = await fetch(validUrl);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return response.json();
	}

	async post<T>(url: string, data: unknown): Promise<T> {
		const validUrl = InputSanitizer.sanitizeUrl(url);
		const response = await fetch(validUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return response.json();
	}

	async patch<T>(url: string, data: unknown): Promise<T> {
		const validUrl = InputSanitizer.sanitizeUrl(url);
		const response = await fetch(validUrl, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return response.json();
	}

	async delete(url: string): Promise<void> {
		const validUrl = InputSanitizer.sanitizeUrl(url);
		const response = await fetch(validUrl, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
	}
}
