import { auth } from "@/auth";
import { MetricsDashboard } from "@/components/metrics/metrics-dashboard";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Força renderização dinâmica devido ao uso de funcionalidades dinâmicas
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Métricas",
    description: "Métricas e insights sobre seu progresso"
};

export default async function MetricsPage() {
    const session = await auth();

    if (!session) {
        redirect("/");
    }

    return (
        <main className="relative flex flex-col gap-4 mx-auto p-2 lg:max-w-[90vw] min-h-screen">
            <div className="flex shadow-sm border rounded-lg text-center animate-[fadeIn_1s_ease-in-out_forwards]">
                <div className="flex justify-between items-center p-4 w-full">
                    <div className="flex-1 font-bold text-4xl md:text-6xl text-center">
                        Métricas & Insights
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 gap-4 shadow-md p-4 border rounded-lg animate-[fadeIn_1s_ease-in-out_forwards]">
                <MetricsDashboard />
            </div>
        </main>
    );
}