export type Theme = "light" | "dark" | "system";
export type Language = "pt-BR" | "en-US" | "es-ES";
export type HomeLayout = "default" | "openclaw";

export interface UserConfig {
	id: string;
	userId: string;
	theme: Theme;
	language: Language;
	homeLayout: HomeLayout;
	notifications: boolean;
	timezone: string;
	createdAt: Date;
	updatedAt: Date;
}