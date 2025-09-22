export const metadata: Metadata = {
    title: "Analytics",
    description: "Análise detalhada do seu desempenho e progresso"
};

import AnalyticsPage from "./analytics-page";
import type { Metadata } from "next";

export default function Page() {
    return (
        <AnalyticsPage />
    )
}
