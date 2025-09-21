import type { UserConfig } from "@/domain/entities/user-config";
import type { UserConfigRepository } from "@/domain/repositories/all-repository";
import type { CreateEntityData } from "@/domain/repositories/base-repository";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaUserConfigRepository implements UserConfigRepository {
	async list(): Promise<UserConfig[]> {
		const configs = await prisma.userConfig.findMany({
			select: {
				id: true,
				userId: true,
				theme: true,
				language: true,
				notifications: true,
				timezone: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		return configs.map(this.toDomain);
	}

	async create(data: CreateEntityData<UserConfig>): Promise<UserConfig> {
		const config = await prisma.userConfig.create({
			data: {
				userId: data.userId,
				theme: data.theme,
				language: data.language,
				notifications: data.notifications,
				timezone: data.timezone,
			},
		});
		return this.toDomain(config);
	}

	async update(config: UserConfig): Promise<UserConfig> {
		const updated = await prisma.userConfig.update({
			where: { id: config.id },
			data: {
				theme: config.theme,
				language: config.language,
				notifications: config.notifications,
				timezone: config.timezone,
			},
		});
		return this.toDomain(updated);
	}

	async delete(id: string): Promise<void> {
		await prisma.userConfig.delete({ where: { id } });
	}

	async findById(id: string): Promise<UserConfig | null> {
		const config = await prisma.userConfig.findUnique({
			where: { id }
		});
		return config ? this.toDomain(config) : null;
	}

	async findByUserId(userId: string): Promise<UserConfig | null> {
		const config = await prisma.userConfig.findUnique({
			where: { userId }
		});
		return config ? this.toDomain(config) : null;
	}

	async upsert(userId: string, configData: Partial<Omit<UserConfig, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<UserConfig> {
		const config = await prisma.userConfig.upsert({
			where: { userId },
			update: {
				theme: configData.theme,
				language: configData.language,
				notifications: configData.notifications,
				timezone: configData.timezone,
			},
			create: {
				userId,
				theme: configData.theme || "light",
				language: configData.language || "pt-BR",
				notifications: configData.notifications ?? true,
				timezone: configData.timezone || "America/Sao_Paulo",
			},
		});
		return this.toDomain(config);
	}

	async deleteByUserId(userId: string): Promise<void> {
		await prisma.userConfig.deleteMany({ where: { userId } });
	}

	private toDomain(config: {
		id: string;
		userId: string;
		theme: string;
		language: string;
		notifications: boolean;
		timezone: string;
		createdAt: Date;
		updatedAt: Date;
	}): UserConfig {
		return {
			id: config.id,
			userId: config.userId,
			theme: config.theme as UserConfig["theme"],
			language: config.language as UserConfig["language"],
			notifications: config.notifications,
			timezone: config.timezone,
			createdAt: config.createdAt,
			updatedAt: config.updatedAt,
		};
	}
}