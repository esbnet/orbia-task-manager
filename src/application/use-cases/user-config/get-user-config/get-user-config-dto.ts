import type { Language, Theme } from "@/domain/entities/user-config";

export type GetUserConfigInput = {
	userId: string;
};

export type GetUserConfigOutput = {
	config: {
		id: string;
		userId: string;
		theme: Theme;
		language: Language;
		notifications: boolean;
		timezone: string;
		createdAt: Date;
		updatedAt: Date;
	} | null;
};