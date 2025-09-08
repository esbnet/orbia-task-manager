import type { GetUserConfigInput, GetUserConfigOutput } from "./get-user-config-dto";

import type { UserConfigRepository } from "@/domain/repositories/all-repository";

export class GetUserConfigUseCase {
	constructor(private readonly userConfigRepository: UserConfigRepository) {}

	async execute(input: GetUserConfigInput): Promise<GetUserConfigOutput> {
		const config = await this.userConfigRepository.findByUserId(input.userId);

		return {
			config,
		};
	}
}