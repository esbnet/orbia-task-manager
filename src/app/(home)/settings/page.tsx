export const metadata: Metadata = {
    title: "Configurações",
    description: "Análise detalhada do seu desempenho e progresso"
};

import type { Metadata } from "next";
import SettingsPage from './settings-page';

// Força renderização dinâmica devido ao uso de autenticação e configurações do usuário
export const dynamic = 'force-dynamic';

export default function Page() {
    return (
        <SettingsPage />
    )
}
