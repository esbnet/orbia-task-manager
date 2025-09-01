import { auth } from "@/auth";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { redirect } from "next/navigation";

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
