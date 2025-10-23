export const metadata: Metadata = {
    title: "Analytics",
    description: "Análise detalhada do seu desempenho e progresso"
};

import type { Metadata } from "next";
import AnalyticsPage from "./analytics-page";

// Força a página a ser dinâmica devido ao uso de useSearchParams e dados dinâmicos
export const dynamic = 'force-dynamic';

export default function Page() {
    return (
        <AnalyticsPage />
    )
}
