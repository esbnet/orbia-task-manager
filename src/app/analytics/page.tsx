import { auth } from "@/auth";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

// Lazy load do componente pesado
const AnalyticsDashboard = dynamic(
	() => import("@/components/analytics/analytics-dashboard").then(mod => ({ default: mod.AnalyticsDashboard })),
	{
		loading: () => (
			<div className="flex justify-center items-center h-64">
				<div className="text-center">
					<div className="mx-auto mb-4 border-purple-600 border-b-2 rounded-full w-8 h-8 animate-spin" />
					<p className="text-gray-600">Carregando analytics...</p>
				</div>
			</div>
		),
		ssr: false, // Desabilitar SSR para este componente
	}
);

export default async function AnalyticsPage() {
	const session = await auth();

	if (!session) {
		redirect("/");
	}

	return (
		<main className="relative flex flex-col gap-4 mx-auto p-2 lg:max-w-[90vw] min-h-screen">
			<div className="flex shadow-sm border rounded-lg text-center animate-[fadeIn_1s_ease-in-out_forwards]">
				<div className="flex justify-between items-center p-4 w-full">
					<div className="flex-1 font-bold text-4xl md:text-6xl text-center">
						Analytics & Relatórios
					</div>
				</div>
			</div>

			<div className="flex flex-col flex-1 gap-4 shadow-md p-4 border rounded-lg animate-[fadeIn_1s_ease-in-out_forwards]">
				<AnalyticsDashboard />
			</div>
		</main>
	);
}
