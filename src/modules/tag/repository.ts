import type { CreateTagInput, Tag, UpdateTagInput } from "./types";

export interface TagRepository {
    list(userId: string): Promise<Tag[]>;
    findById(id: string): Promise<Tag | null>;
    create(input: CreateTagInput): Promise<Tag>;
    update(input: UpdateTagInput & Pick<Tag, "name" | "color">): Promise<Tag>;
    delete(id: string): Promise<void>;
}
