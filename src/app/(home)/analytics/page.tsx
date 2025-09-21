export const metadata: Metadata = {
    title: "Analytics - Orbia",
    description: "Análise detalhada do seu desempenho e progresso"
};

import type { Metadata } from "next";

import AnalyticsPage from './analitics-page';

export default function Page() {
    return (
        <AnalyticsPage />
    )
}
