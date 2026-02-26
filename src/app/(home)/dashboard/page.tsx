import { IndicatorsDashboard } from "@/components/dashboard/indicators-dashboard";
import type { Metadata } from "next";

// Força renderização dinâmica devido ao uso de funcionalidades dinâmicas como headers
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Visão geral dos seus indicadores e progresso"
};

export default function DashboardPage() {
    return (
        <div className="mx-auto px-4 py-8">
            <IndicatorsDashboard />
        </div>
    );
}