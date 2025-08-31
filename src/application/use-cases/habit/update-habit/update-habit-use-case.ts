import type { UpdateHabitInput, UpdateHabitOutput } from "./update-habit-dto";

import type { HabitRepository } from "@/domain/repositories/all-repository";

export class UpdateHabitUseCase {
	constructor(private readonly habitRepository: HabitRepository) {}

	async execute(inputHabit: UpdateHabitInput): Promise<UpdateHabitOutput> {
		// Buscar o hábito existente
		const existingHabit = await this.habitRepository.findById(inputHabit.id);

		if (!existingHabit) {
			throw new Error(`Hábito com ID ${inputHabit.id} não encontrado`);
		}

		// Mesclar os dados existentes com as atualizações
		const updatedHabit = {
			...existingHabit,
			...inputHabit,
			updatedAt: new Date(),
		};

		// Atualizar no repositório
		const result = await this.habitRepository.update(updatedHabit);
		return result;
	}
}
