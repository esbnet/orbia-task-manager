import type { HabitRepository } from "@/domain/repositories/all-repository";

export interface DeleteHabitInput {
	id: string;
}

export interface DeleteHabitOutput {
	success: boolean;
}

export class DeleteHabitUseCase {
	constructor(private habitRepository: HabitRepository) {}

	async execute(input: DeleteHabitInput): Promise<DeleteHabitOutput> {
		await this.habitRepository.delete(input.id);
		return { success: true };
	}
}
