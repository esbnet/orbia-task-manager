import type { HomeLayout, Language, Theme } from "@/domain/entities/user-config";

export type UpdateUserConfigInput = {
	userId: string;
	theme?: Theme;
	language?: Language;
	homeLayout?: HomeLayout;
	notifications?: boolean;
	timezone?: string;
};

export type UpdateUserConfigOutput = {
	config: {
		id: string;
		userId: string;
		theme: Theme;
		language: Language;
		homeLayout: HomeLayout;
		notifications: boolean;
		timezone: string;
		createdAt: Date;
		updatedAt: Date;
	};
};