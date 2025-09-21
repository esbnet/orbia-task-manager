import type { Tag } from "@/domain/entities/tag";
import type { TagRepository } from "@/domain/repositories/all-repository";

export interface UpdateTagInput {
	tag: Tag;
}

export interface UpdateTagOutput {
	tag: Tag;
}

export class UpdateTagUseCase {
	constructor(private tagRepository: TagRepository) {}

	async execute(input: UpdateTagInput): Promise<UpdateTagOutput> {
		const tag = await this.tagRepository.update(input.tag);
		return { tag };
	}
}
