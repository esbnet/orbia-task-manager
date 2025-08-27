import type { Tag } from "@/domain/entities/tag";
import type { TagRepository } from "@/domain/repositories/all-repository";
import { getCurrentUserId } from "@/hooks/use-current-user";
import { prisma } from "@/infra/database/prisma/prisma-client";

export class PrismaTagRepository implements TagRepository {
	async list(): Promise<Tag[]> {
		try {
			const userId = await getCurrentUserId();
			if (!userId) return [];

			const tags = await prisma.tag.findMany({
				where: { userId },
				orderBy: { name: "asc" },
			});

			// Se não há tags, criar algumas padrão baseadas nas tarefas existentes
			if (tags.length === 0) {
				// Buscar tags únicas das tarefas existentes
				const [todos, dailies, habits] = await Promise.all([
					prisma.todo.findMany({ select: { tags: true } }),
					prisma.daily.findMany({ select: { tags: true } }),
					prisma.habit.findMany({ select: { tags: true } }),
				]);

				const allTags = new Set<string>();
				for (const item of [...todos, ...dailies, ...habits]) {
					if (Array.isArray(item.tags)) {
						for (const tag of item.tags) {
							allTags.add(tag);
						}
					}
				}

				const colors = [
					"#3b82f6",
					"#10b981",
					"#f59e0b",
					"#ef4444",
					"#8b5cf6",
					"#06b6d4",
				];
				let colorIndex = 0;

				for (const tagName of allTags) {
					await prisma.tag.create({
						data: {
							name: tagName,
							color: colors[colorIndex % colors.length],
							userId,
						},
					});
					colorIndex++;
				}

				// Se ainda não há tags, criar algumas padrão
				if (allTags.size === 0) {
					const defaultTags = [
						{ name: "Trabalho", color: "#3b82f6" },
						{ name: "Estudo", color: "#10b981" },
						{ name: "Pessoal", color: "#f59e0b" },
					];

					for (const tag of defaultTags) {
						await prisma.tag.create({
							data: {
								...tag,
								userId,
							},
						});
					}
				}

				const newTags = await prisma.tag.findMany({
					orderBy: { name: "asc" },
				});
				return newTags.map(this.toDomain);
			}

			return tags.map(this.toDomain);
		} catch (error) {
			console.error("Error listing tags:", error);
			return [];
		}
	}

	async create(data: Omit<Tag, "id" | "createdAt">): Promise<Tag> {
		const userId = await getCurrentUserId();
		if (!userId) throw new Error("User not authenticated");

		// Verificar se o usuário existe, se não, criar
		await prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: { id: userId },
		});

		const tag = await prisma.tag.create({
			data: {
				name: data.name,
				color: data.color,
				userId,
			},
		});
		return this.toDomain(tag);
	}

	async update(tag: Tag): Promise<Tag> {
		const updated = await prisma.tag.update({
			where: { id: tag.id },
			data: {
				name: tag.name,
				color: tag.color,
			},
		});
		return this.toDomain(updated);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async toggleComplete(_id: string): Promise<Tag> {
		throw new Error("Toggle complete not implemented for tags");
	}

	async delete(id: string): Promise<void> {
		await prisma.tag.delete({ where: { id } });
	}

	private toDomain(tag: {
		id: string;
		name: string;
		color: string;
		createdAt: Date;
	}): Tag {
		return {
			id: tag.id,
			name: tag.name,
			color: tag.color,
			createdAt: tag.createdAt,
		};
	}
}
