"use client";

import {
	type ReactNode,
	createContext,
	useCallback,
	useEffect,
	useContext as useReactContext,
	useState,
} from "react";

// Base interfaces for entities
export interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt?: Date;
}

// Base form data interface
export interface BaseFormData {
	[key: string]: any;
}

// Base context type interface
export interface BaseContextType<TEntity extends BaseEntity, TFormData extends BaseFormData> {
	entities: TEntity[];
	loading: boolean;
	error: string | null;
	create: (data: TFormData) => Promise<void>;
	update: (id: string, data: Partial<TEntity>) => Promise<void>;
	delete: (id: string) => Promise<void>;
	refresh: () => Promise<void>;
}

// Service interface for business logic
export interface EntityService<TEntity extends BaseEntity, TFormData extends BaseFormData> {
	list(): Promise<TEntity[]>;
	create(data: TFormData): Promise<TEntity>;
	update(id: string, data: Partial<TEntity>): Promise<TEntity>;
	delete(id: string): Promise<void>;
}

// Factory options
export interface EntityContextOptions<TEntity extends BaseEntity, TFormData extends BaseFormData> {
	entityName: string;
	service: EntityService<TEntity, TFormData>;
	initialData?: TEntity[];
	enableCache?: boolean;
	cacheTimeout?: number;
}

// Context factory function
export function createEntityContext<TEntity extends BaseEntity, TFormData extends BaseFormData>(
	options: EntityContextOptions<TEntity, TFormData>
) {
	const { entityName, service, initialData = [], enableCache = false, cacheTimeout = 5 * 60 * 1000 } = options;

	// Create context type
	type ContextType = BaseContextType<TEntity, TFormData>;

	// Create context
	const Context = createContext<ContextType | undefined>(undefined);

	// Provider component
	function Provider({ children }: { children: ReactNode }) {
		const [entities, setEntities] = useState<TEntity[]>(initialData);
		const [loading, setLoading] = useState(true);
		const [error, setError] = useState<string | null>(null);
		const [lastFetch, setLastFetch] = useState<number>(0);

		const fetchEntities = useCallback(async (force = false) => {
			console.log(`🎯 fetchEntities ${entityName} - INICIANDO`, { force, entitiesLength: entities.length, enableCache });

			// Cache logic
			if (enableCache && !force && entities.length > 0) {
				const now = Date.now();
				if (now - lastFetch < cacheTimeout) {
					console.log(`🎯 fetchEntities ${entityName} - CACHE HIT, pulando`);
					return;
				}
			}

			try {
				console.log(`🎯 fetchEntities ${entityName} - setLoading(true)`);
				setLoading(true);
				setError(null);

				console.log(`🎯 fetchEntities ${entityName} - chamando service.list()`);
				const fetchedEntities = await service.list();
				console.log(`🎯 fetchEntities ${entityName} - service.list() retornou:`, fetchedEntities.length, "entidades");

				setEntities(fetchedEntities);
				setLastFetch(Date.now());
				console.log(`🎯 fetchEntities ${entityName} - setEntities executado`);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : `Erro ao carregar ${entityName.toLowerCase()}s`;
				console.log(`🎯 fetchEntities ${entityName} - ERRO:`, err);
				setError(errorMessage);
				console.error(`Error fetching ${entityName}:`, err);
			} finally {
				console.log(`🎯 fetchEntities ${entityName} - setLoading(false)`);
				setLoading(false);
			}
		}, [entityName, service, enableCache, cacheTimeout]);

		const create = async (data: TFormData) => {
			try {
				setError(null);
				const newEntity = await service.create(data);
				setEntities((prev) => [newEntity, ...prev]);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : `Erro ao criar ${entityName.toLowerCase()}`;
				setError(errorMessage);
				throw err;
			}
		};

		const update = async (id: string, data: Partial<TEntity>) => {
			try {
				setError(null);
				const updatedEntity = await service.update(id, data);
				setEntities((prev) =>
					prev.map((entity) =>
						entity.id === id ? { ...entity, ...updatedEntity } : entity
					)
				);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : `Erro ao atualizar ${entityName.toLowerCase()}`;
				setError(errorMessage);
				throw err;
			}
		};

		const deleteEntity = async (id: string) => {
			try {
				setError(null);
				await service.delete(id);
				setEntities((prev) => prev.filter((entity) => entity.id !== id));
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : `Erro ao excluir ${entityName.toLowerCase()}`;
				setError(errorMessage);
				throw err;
			}
		};

		const refresh = async () => {
			await fetchEntities(true);
		};

		useEffect(() => {
			console.log(`🎯 useEffect ${entityName} - EXECUTANDO fetchEntities`);
			fetchEntities();
		}, []); // Dependências vazias para executar apenas uma vez

		const value: ContextType = {
			entities,
			loading,
			error,
			create,
			update,
			delete: deleteEntity,
			refresh,
		};

		return <Context.Provider value={value}>{children}</Context.Provider>;
	}

	// Hook to use the context
	function useEntityContext() {
		const context = useReactContext(Context);
		if (context === undefined) {
			throw new Error(`use${entityName} deve ser usado dentro de um ${entityName}Provider`);
		}
		return context;
	}

	return {
		Context,
		Provider,
		useContext: useEntityContext,
	};
}
