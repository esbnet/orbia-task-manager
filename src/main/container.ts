/**
 * Container legado — mantido como stub para compatibilidade.
 * Toda a lógica foi migrada para src/modules/{todo,habit,goal,tag}.
 */
export class DIContainer {
	private static instance: DIContainer;

	private constructor() { }

	public static getInstance(): DIContainer {
		if (!DIContainer.instance) {
			DIContainer.instance = new DIContainer();
		}
		return DIContainer.instance;
	}
}

export const container = DIContainer.getInstance();