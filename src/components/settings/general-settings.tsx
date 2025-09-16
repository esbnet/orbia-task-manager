"use client";

import { useEffect, useState } from "react";

import { useUserConfig } from "@/hooks/use-user-config";
import { toast } from "sonner";

export function GeneralSettings() {
    const { config, updateConfig, isUpdating, updateError } = useUserConfig();
    const [localConfig, setLocalConfig] = useState(config);

    // Atualizar configuração local quando o config global mudar
    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleSave = async () => {
        try {
            await updateConfig(localConfig);
            toast.success("Configurações salvas com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar configurações");
        }
    };

    const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(config);

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 border rounded-lg">
                <h3 className="mb-4 font-semibold text-lg">Configurações Gerais</h3>
                <p className="mb-6 text-muted-foreground">
                    Gerencie suas preferências pessoais e configurações da aplicação.
                </p>

                <div className="space-y-6">
                    {/* Tema */}
                    <div className="space-y-2">
                        <label htmlFor="theme" className="font-medium text-sm">Tema</label>
                        <select
                            id="theme"
                            value={localConfig.theme}
                            onChange={(e) =>
                                setLocalConfig(prev => ({ ...prev, theme: e.target.value as "light" | "dark" | "system" }))
                            }
                            className="bg-background p-2 border rounded-md w-full"
                        >
                            <option value="light">Claro</option>
                            <option value="dark">Escuro</option>
                            <option value="system">Sistema</option>
                        </select>
                        <p className="text-muted-foreground text-sm">
                            Escolha o tema da interface ou deixe que siga as configurações do sistema.
                        </p>
                    </div>

                    {/* Idioma */}
                    <div className="space-y-2">
                        <label htmlFor="language" className="font-medium text-sm">Idioma</label>
                        <select
                            id="language"
                            value={localConfig.language}
                            onChange={(e) =>
                                setLocalConfig(prev => ({ ...prev, language: e.target.value as "pt-BR" | "en-US" | "es-ES" }))
                            }
                            className="bg-background p-2 border rounded-md w-full"
                        >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español</option>
                        </select>
                        <p className="text-muted-foreground text-sm">
                            Idioma da interface da aplicação.
                        </p>
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2">
                        <label htmlFor="timezone" className="font-medium text-sm">Fuso Horário</label>
                        <select
                            id="timezone"
                            value={localConfig.timezone}
                            onChange={(e) =>
                                setLocalConfig(prev => ({ ...prev, timezone: e.target.value }))
                            }
                            className="bg-background p-2 border rounded-md w-full"
                        >
                            <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                            <option value="America/Bahia">Salvador (GMT-3)</option>
                            <option value="America/Recife">Recife (GMT-3)</option>
                            <option value="America/Manaus">Manaus (GMT-4)</option>
                            <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                            <option value="UTC">UTC</option>
                            <option value="Europe/London">Londres (GMT+0)</option>
                            <option value="Europe/Paris">Paris (GMT+1)</option>
                            <option value="America/New_York">Nova York (GMT-5)</option>
                            <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                            <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                        </select>
                        <p className="text-muted-foreground text-sm">
                            Fuso horário para exibição de datas e horários.
                        </p>
                    </div>

                    {/* Notificações */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                            <label htmlFor="notifications" className="font-medium text-sm">Notificações</label>
                            <p className="text-muted-foreground text-sm">
                                Receber notificações da aplicação.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            id="notifications"
                            checked={localConfig.notifications}
                            onChange={(e) =>
                                setLocalConfig(prev => ({ ...prev, notifications: e.target.checked }))
                            }
                            className="bg-background disabled:opacity-50 shadow-xs border border-input rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-4 h-4 text-primary disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Botão de salvar */}
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isUpdating}
                            className="bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded-md min-w-[120px] text-primary-foreground disabled:cursor-not-allowed"
                        >
                            {isUpdating ? "Salvando..." : "Salvar"}
                        </button>
                    </div>

                    {/* Mensagem de erro */}
                    {updateError && (
                        <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
                            Erro ao salvar configurações: {updateError.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}