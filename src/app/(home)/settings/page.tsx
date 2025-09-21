export const metadata: Metadata = {
    title: "Configurações",
    description: "Análise detalhada do seu desempenho e progresso"
};

import type { Metadata } from "next";
import SettingsPage from './settings-page';

export default function Page() {
    return (
        <SettingsPage />
    )
}
