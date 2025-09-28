import { IndicatorsDashboard } from "@/components/dashboard/indicators-dashboard";
import type { Metadata } from "next";

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