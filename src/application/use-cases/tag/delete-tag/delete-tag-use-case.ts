import type { TagRepository } from "@/domain/repositories/all-repository";

export interface DeleteTagInput {
	id: string;
}

export interface DeleteTagOutput {
	success: boolean;
}

export class DeleteTagUseCase {
	constructor(private tagRepository: TagRepository) {}

	async execute(input: DeleteTagInput): Promise<DeleteTagOutput> {
		await this.tagRepository.delete(input.id);
		return { success: true };
	}
}
