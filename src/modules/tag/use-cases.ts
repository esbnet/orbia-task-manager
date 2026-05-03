import type { TagRepository } from "./repository";
import type { CreateTagInput, Tag, UpdateTagInput } from "./types";

export async function listTags(repo: TagRepository, userId: string): Promise<Tag[]> {
    return repo.list(userId);
}

export async function createTag(repo: TagRepository, input: CreateTagInput): Promise<Tag> {
    return repo.create(input);
}

export async function updateTag(
    repo: TagRepository,
    input: UpdateTagInput & Pick<Tag, "name" | "color">,
): Promise<Tag> {
    const existing = await repo.findById(input.id);
    if (!existing) throw new Error(`Tag com ID ${input.id} não encontrada`);
    return repo.update({ ...existing, ...input });
}

export async function deleteTag(repo: TagRepository, id: string): Promise<void> {
    return repo.delete(id);
}
