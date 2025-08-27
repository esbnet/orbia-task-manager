import type { Tag } from "@/domain/entities/tag";
import type { TagRepository } from "@/domain/repositories/all-repository";

export interface CreateTagInput {
	name: string;
	color: string;
}

export interface CreateTagOutput {
	tag: Tag;
}

export class CreateTagUseCase {
	constructor(private tagRepository: TagRepository) {}

	async execute(input: CreateTagInput): Promise<CreateTagOutput> {
		const tag = await this.tagRepository.create({
			name: input.name,
			color: input.color,
		});

		return { tag };
	}
}
