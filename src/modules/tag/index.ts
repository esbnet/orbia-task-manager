import { prisma } from "@/infra/database/prisma/prisma-client";
import type { TagRepository } from "./repository";
import type { CreateTagInput, Tag, UpdateTagInput } from "./types";
import { createTag, deleteTag, listTags, updateTag } from "./use-cases";

// ── Prisma adapter ─────────────────────────────────────────────────────────

class PrismaTagRepository implements TagRepository {
    async list(userId: string): Promise<Tag[]> {
        const tags = await prisma.tag.findMany({
            where: { userId },
            orderBy: { name: "asc" },
        });
        return tags.map(toDomain);
    }

    async findById(id: string): Promise<Tag | null> {
        const tag = await prisma.tag.findUnique({ where: { id } });
        return tag ? toDomain(tag) : null;
    }

    async create(input: CreateTagInput): Promise<Tag> {
        await prisma.user.upsert({
            where: { id: input.userId },
            update: {},
            create: { id: input.userId },
        });
        const tag = await prisma.tag.create({
            data: { name: input.name, color: input.color, userId: input.userId },
        });
        return toDomain(tag);
    }

    async update(input: UpdateTagInput & Pick<Tag, "name" | "color">): Promise<Tag> {
        const updated = await prisma.tag.update({
            where: { id: input.id },
            data: { name: input.name, color: input.color },
        });
        return toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await prisma.tag.delete({ where: { id } });
    }
}

function toDomain(raw: {
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt: Date;
}): Tag {
    return {
        id: raw.id,
        name: raw.name,
        color: raw.color,
        userId: raw.userId,
        createdAt: raw.createdAt,
    };
}

// ── Singleton ───────────────────────────────────────────────────────────────

const _repo = new PrismaTagRepository();

// ── Facade ──────────────────────────────────────────────────────────────────

export const TagModule = {
    list(userId: string): Promise<Tag[]> {
        return listTags(_repo, userId);
    },
    create(input: CreateTagInput): Promise<Tag> {
        return createTag(_repo, input);
    },
    update(input: UpdateTagInput & Pick<Tag, "name" | "color">): Promise<Tag> {
        return updateTag(_repo, input);
    },
    delete(id: string): Promise<void> {
        return deleteTag(_repo, id);
    },
};

export type { CreateTagInput, Tag, UpdateTagInput } from "./types";

