export type Theme = "light" | "dark" | "system";
export type Language = "pt-BR" | "en-US" | "es-ES" | "fr-FR";

export interface UserConfig {
	id: string;
	userId: string;
	theme: Theme;
	language: Language;
	notifications: boolean;
	timezone: string;
	createdAt: Date;
	updatedAt: Date;
}