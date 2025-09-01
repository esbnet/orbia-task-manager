"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { useGoals } from "@/contexts/goal-context";
import { ptBR } from "date-fns/locale";

interface AnalyticsData {
	totalGoals: number;
	completedGoals: number;
	inProgressGoals: number;
	overdueGoals: number;
	completionRate: number;
	averageCompletionTime: number;
	goalsByCategory: Array<{ name: string; value: number; color: string }>;
	goalsByPriority: Array<{ name: string; value: number; color: string }>;
	weeklyProgress: Array<{ date: string; completed: number; total: number }>;
	monthlyTrends: Array<{ month: string; goals: number; completed: number }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function AnalyticsDashboard() {
	const { goals } = useGoals();
	const [timeRange, setTimeRange] = useState<
		"week" | "month" | "quarter" | "year"
	>("month");
	const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
		null,
	);


	const calculateAnalytics = useCallback(() => {
		const now = new Date();
		const startDate = getStartDate(timeRange);

		const filteredGoals = goals.filter(
			(goal) =>
				goal.createdAt >= startDate || goal.targetDate >= startDate,
		);

		const totalGoals = filteredGoals.length;
		const completedGoals = filteredGoals.filter(
			(goal) => goal.status === "COMPLETED",
		).length;
		const inProgressGoals = filteredGoals.filter(
			(goal) => goal.status === "IN_PROGRESS",
		).length;
		const overdueGoals = filteredGoals.filter(
			(goal) => goal.status === "IN_PROGRESS" && goal.targetDate < now,
		).length;

		const completionRate =
			totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

		// Goals by Category
		const categoryMap = new Map<string, number>();
		for (const goal of filteredGoals) {
			const category = goal.category;
			categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
		}

		const goalsByCategory = Array.from(categoryMap.entries()).map(
			([name, value], index) => ({
				name: getCategoryLabel(name),
				value,
				color: COLORS[index % COLORS.length],
			}),
		);

		// Goals by Priority
		const priorityMap = new Map<string, number>();
		for (const goal of filteredGoals) {
			const priority = goal.priority;
			priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1);
		}

		const goalsByPriority = Array.from(priorityMap.entries()).map(
			([name, value], index) => ({
				name: getPriorityLabel(name),
				value,
				color: COLORS[index % COLORS.length],
			}),
		);

		// Weekly Progress
		const weeklyProgress = generateWeeklyProgress(filteredGoals);

		// Monthly Trends
		const monthlyTrends = generateMonthlyTrends(filteredGoals);

		setAnalyticsData({
			totalGoals,
			completedGoals,
			inProgressGoals,
			overdueGoals,
			completionRate,
			averageCompletionTime: 0, // TODO: Implementar cálculo real
			goalsByCategory,
			goalsByPriority,
			weeklyProgress,
			monthlyTrends,
		});
	}, [timeRange, goals]);

	useEffect(() => {
		if (goals.length > 0) {
			calculateAnalytics();
		}
	}, [calculateAnalytics]);

	const getStartDate = (range: string) => {
		const now = new Date();
		switch (range) {
			case "week":
				return startOfWeek(now, { locale: ptBR });
			case "month":
				return new Date(now.getFullYear(), now.getMonth(), 1);
			case "quarter":
				return new Date(
					now.getFullYear(),
					Math.floor(now.getMonth() / 3) * 3,
					1,
				);
			case "year":
				return new Date(now.getFullYear(), 0, 1);
			default:
				return new Date(now.getFullYear(), now.getMonth(), 1);
		}
	};

	const generateWeeklyProgress = (
		filteredGoals: { createdAt: Date; targetDate: Date; status: string }[],
	) => {
		const now = new Date();
		const weekStart = startOfWeek(now, { locale: ptBR });
		const weekEnd = endOfWeek(now, { locale: ptBR });
		const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

		return weekDays.map((day) => {
			const dayGoals = filteredGoals.filter(
				(goal) =>
					goal.createdAt.toDateString() === day.toDateString() ||
					goal.targetDate.toDateString() === day.toDateString(),
			);
			const completed = dayGoals.filter(
				(goal) => goal.status === "COMPLETED",
			).length;

			return {
				date: format(day, "EEE", { locale: ptBR }),
				completed,
				total: dayGoals.length,
			};
		});
	};

	const generateMonthlyTrends = (
		filteredGoals: { createdAt: Date; status: string }[],
	) => {
		const months: {
			month: string;
			goals: number;
			completed: number;
		}[] = [];
		const now = new Date();

		for (let i = 11; i >= 0; i--) {
			const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthGoals = filteredGoals.filter(
				(goal) =>
					goal.createdAt.getMonth() === month.getMonth() &&
					goal.createdAt.getFullYear() === month.getFullYear(),
			);

			months.push({
				month: format(month, "MMM", { locale: ptBR }),
				goals: monthGoals.length,
				completed: monthGoals.filter(
					(goal) => goal.status === "COMPLETED",
				).length,
			});
		}

		return months;
	};

	const getCategoryLabel = (category: string) => {
		const labels: Record<string, string> = {
			PERSONAL: "Pessoal",
			WORK: "Trabalho",
			HEALTH: "Saúde",
			LEARNING: "Aprendizado",
		};
		return labels[category] || category;
	};

	const getPriorityLabel = (priority: string) => {
		const labels: Record<string, string> = {
			LOW: "Baixa",
			MEDIUM: "Média",
			HIGH: "Alta",
			URGENT: "Urgente",
		};
		return labels[priority] || priority;
	};

	if (!analyticsData) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="text-center">
					<div className="mx-auto mb-4 border-purple-600 border-b-2 rounded-full w-8 h-8 animate-spin" />
					<p className="text-gray-600">Carregando analytics...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h2 className="font-bold text-gray-900 dark:text-gray-100 text-2xl">
						Dashboard de Analytics
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Acompanhe seu progresso e performance
					</p>
				</div>
				<Select
					value={timeRange}
					onValueChange={(value) =>
						setTimeRange(
							value as "week" | "month" | "quarter" | "year",
						)
					}
				>
					<SelectTrigger className="w-32">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="week">Semana</SelectItem>
						<SelectItem value="month">Mês</SelectItem>
						<SelectItem value="quarter">Trimestre</SelectItem>
						<SelectItem value="year">Ano</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Key Metrics */}
			<div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Total de Metas
						</CardTitle>
						<Target className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{analyticsData.totalGoals}
						</div>
						<p className="text-muted-foreground text-xs">
							{timeRange === "week"
								? "Esta semana"
								: timeRange === "month"
									? "Este mês"
									: timeRange === "quarter"
										? "Este trimestre"
										: "Este ano"}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Taxa de Conclusão
						</CardTitle>
						<CheckCircle className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{analyticsData.completionRate.toFixed(1)}%
						</div>
						<p className="text-muted-foreground text-xs">
							{analyticsData.completedGoals} de{" "}
							{analyticsData.totalGoals} concluídas
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Em Andamento
						</CardTitle>
						<Clock className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{analyticsData.inProgressGoals}
						</div>
						<p className="text-muted-foreground text-xs">
							Metas ativas
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Atrasadas
						</CardTitle>
						<AlertTriangle className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-red-600 text-2xl">
							{analyticsData.overdueGoals}
						</div>
						<p className="text-muted-foreground text-xs">
							Requerem atenção
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Visão Geral</TabsTrigger>
					<TabsTrigger value="progress">
						Progresso Semanal
					</TabsTrigger>
					<TabsTrigger value="trends">Tendências Mensais</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Metas por Categoria</CardTitle>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={analyticsData.goalsByCategory}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) =>
												`${name} ${(percent * 100).toFixed(0)}%`
											}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{analyticsData.goalsByCategory.map(
												(entry) => (
													<Cell
														key={entry.name}
														fill={entry.color}
													/>
												),
											)}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Metas por Prioridade</CardTitle>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<BarChart
										data={analyticsData.goalsByPriority}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="name" />
										<YAxis />
										<Tooltip />
										<Bar dataKey="value" fill="#8884d8" />
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="progress" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Progresso Semanal</CardTitle>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={analyticsData.weeklyProgress}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="date" />
									<YAxis />
									<Tooltip />
									<Bar
										dataKey="completed"
										fill="#00C49F"
										name="Concluídas"
									/>
									<Bar
										dataKey="total"
										fill="#8884d8"
										name="Total"
									/>
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="trends" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Tendências Mensais</CardTitle>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={analyticsData.monthlyTrends}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="month" />
									<YAxis />
									<Tooltip />
									<Line
										type="monotone"
										dataKey="goals"
										stroke="#8884d8"
										name="Total de Metas"
									/>
									<Line
										type="monotone"
										dataKey="completed"
										stroke="#00C49F"
										name="Concluídas"
									/>
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
