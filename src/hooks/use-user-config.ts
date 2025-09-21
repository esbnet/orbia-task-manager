import type { Language, Theme, UserConfig } from "@/domain/entities/user-config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// Tipos para localStorage
interface LocalUserConfig {
	theme: Theme;
	language: Language;
	notifications: boolean;
	timezone: string;
}

// Valores padrão
const DEFAULT_CONFIG: LocalUserConfig = {
	theme: "light",
	language: "pt-BR",
	notifications: true,
	timezone: "America/Sao_Paulo",
};

// Query keys
export const userConfigKeys = {
	all: ["user-config"] as const,
	current: () => [...userConfigKeys.all, "current"] as const,
};

// Funções utilitárias para localStorage
const getLocalConfig = (): LocalUserConfig => {
	if (typeof window === "undefined") return DEFAULT_CONFIG;

	try {
		const stored = localStorage.getItem("user-config");
		if (stored) {
			const parsed = JSON.parse(stored);
			return { ...DEFAULT_CONFIG, ...parsed };
		}
	} catch (error) {
		console.error("Erro ao ler configurações do localStorage:", error);
	}

	return DEFAULT_CONFIG;
};

const setLocalConfig = (config: Partial<LocalUserConfig>) => {
	if (typeof window === "undefined") return;

	try {
		const current = getLocalConfig();
		const updated = { ...current, ...config };
		localStorage.setItem("user-config", JSON.stringify(updated));
	} catch (error) {
		console.error("Erro ao salvar configurações no localStorage:", error);
	}
};

// Hook principal para gerenciar configurações do usuário
export function useUserConfig() {
	const queryClient = useQueryClient();
	const [localConfig, setLocalConfigState] = useState<LocalUserConfig>(DEFAULT_CONFIG);

	// Carregar configurações do localStorage no primeiro render
	useEffect(() => {
		const config = getLocalConfig();
		setLocalConfigState(config);
	}, []);

	// Query para buscar configurações do backend
	const {
		data: serverConfig,
		isLoading,
		error,
	} = useQuery({
		queryKey: userConfigKeys.current(),
		queryFn: async (): Promise<UserConfig | null> => {
			const response = await fetch("/api/user/config");
			if (!response.ok) {
				if (response.status === 401) {
					// Usuário não autenticado, retorna null
					return null;
				}
				throw new Error("Erro ao buscar configurações");
			}
			const data = await response.json();
			return data.config;
		},
		staleTime: 5 * 60 * 1000, // 5 minutos
	});

	// Sincronizar localStorage com servidor quando receber dados do backend
	useEffect(() => {
		if (serverConfig) {
			const serverLocalConfig: LocalUserConfig = {
				theme: serverConfig.theme,
				language: serverConfig.language,
				notifications: serverConfig.notifications,
				timezone: serverConfig.timezone,
			};
			setLocalConfig(serverLocalConfig);
			setLocalConfigState(serverLocalConfig);
		}
	}, [serverConfig]);

	// Mutation para atualizar configurações
	const updateConfigMutation = useMutation({
		mutationFn: async (config: Partial<LocalUserConfig>): Promise<UserConfig> => {
			const response = await fetch("/api/user/config", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(config),
			});

			if (!response.ok) {
				throw new Error("Erro ao atualizar configurações");
			}

			const result = await response.json();
			return result.config;
		},
		onSuccess: (data) => {
			// Atualizar cache do React Query
			queryClient.setQueryData(userConfigKeys.current(), data);

			// Atualizar localStorage
			const updatedLocalConfig: LocalUserConfig = {
				theme: data.theme,
				language: data.language,
				notifications: data.notifications,
				timezone: data.timezone,
			};
			setLocalConfig(updatedLocalConfig);
			setLocalConfigState(updatedLocalConfig);
		},
	});

	// Função para atualizar configurações (atualiza localStorage imediatamente)
	const updateConfig = (config: Partial<LocalUserConfig>) => {
		// Atualizar localStorage imediatamente para resposta instantânea
		const updatedConfig = { ...localConfig, ...config };
		setLocalConfig(updatedConfig);
		setLocalConfigState(updatedConfig);

		// Enviar para o servidor em background
		updateConfigMutation.mutate(config);
	};

	return {
		config: localConfig,
		serverConfig,
		isLoading,
		error,
		updateConfig,
		isUpdating: updateConfigMutation.isPending,
		updateError: updateConfigMutation.error,
	};
}

// Hook específico para tema
export function useTheme() {
	const { config, updateConfig } = useUserConfig();

	const setTheme = (theme: Theme) => {
		updateConfig({ theme });
	};

	return {
		theme: config.theme,
		setTheme,
	};
}

// Hook específico para idioma
export function useLanguage() {
	const { config, updateConfig } = useUserConfig();

	const setLanguage = (language: Language) => {
		updateConfig({ language });
	};

	return {
		language: config.language,
		setLanguage,
	};
}

// Hook específico para notificações
export function useNotifications() {
	const { config, updateConfig } = useUserConfig();

	const setNotifications = (notifications: boolean) => {
		updateConfig({ notifications });
	};

	return {
		notifications: config.notifications,
		setNotifications,
	};
}