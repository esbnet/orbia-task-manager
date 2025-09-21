"use client";

import { Pie, PieChart } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";

export const description = "Um gráfico de pizza com legenda";

const chartData = [
	{ browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
	{ browser: "safari", visitors: 200, fill: "var(--color-safari)" },
	{ browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
	{ browser: "edge", visitors: 173, fill: "var(--color-edge)" },
	{ browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig = {
	visitors: {
		label: "Visitors",
	},
	chrome: {
		label: "Chrome",
		color: "var(--chart-1)",
	},
	safari: {
		label: "Safari",
		color: "var(--chart-2)",
	},
	firefox: {
		label: "Firefox",
		color: "var(--chart-3)",
	},
	edge: {
		label: "Edge",
		color: "var(--chart-4)",
	},
	other: {
		label: "Other",
		color: "var(--chart-5)",
	},
} satisfies ChartConfig;

export function ChartPieLegend() {
	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Progresso de Tarefas</CardTitle>
				<CardDescription>January - June 2024</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto max-h-[300px] aspect-square"
				>
					<PieChart>
						<Pie data={chartData} dataKey="visitors" />
						<ChartLegend
							content={<ChartLegendContent nameKey="browser" />}
							className="flex-wrap *:justify-center gap-2 -translate-y-2 *:basis-1/4"
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
