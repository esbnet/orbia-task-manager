import type { Tag } from "@/domain/entities/tag";
import type { TagRepository } from "@/domain/repositories/all-repository";

export interface ListTagOutput {
	tags: Tag[];
}

export class ListTagUseCase {
	constructor(private tagRepository: TagRepository) {}

	async execute(): Promise<ListTagOutput> {
		const tags = await this.tagRepository.list();
		return { tags };
	}
}
