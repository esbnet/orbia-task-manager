import type { UpdateUserConfigInput, UpdateUserConfigOutput } from "./update-user-config-dto";

import type { UserConfigRepository } from "@/domain/repositories/all-repository";

export class UpdateUserConfigUseCase {
	constructor(private readonly userConfigRepository: UserConfigRepository) {}

	async execute(input: UpdateUserConfigInput): Promise<UpdateUserConfigOutput> {
		const { userId, ...configData } = input;

		const config = await this.userConfigRepository.upsert(userId, configData);

		return {
			config,
		};
	}
}