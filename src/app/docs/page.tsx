export const metadata: Metadata = {
    title: "API Doc",
    description: "Análise detalhada do seu desempenho e progresso"
};

import type { Metadata } from "next";
import DocsPage from "./docs-page";

export default function Page() {
    return (
        <DocsPage />
    )
}
