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
import { useAvailableDailies } from "@/hooks/use-dailies";
import { useHabitsAnalytics, type HabitAnalyticsData } from "@/hooks/use-habits-analytics";
import { useTodos } from "@/hooks/use-todos";
import { ptBR } from "date-fns/locale";

interface AnalyticsData {
	// Goals data
	totalGoals: number;
	completedGoals: number;
	inProgressGoals: number;
	overdueGoals: number;
	completionRate: number;
	averageCompletionTime: number;
	goalsByPriority: Array<{ name: string; value: number; color: string }>;
	weeklyProgress: Array<{ date: string; completed: number; total: number }>;
	monthlyTrends: Array<{ month: string; goals: number; completed: number }>;

	// Habits data
	habitsData?: HabitAnalyticsData;

	// Todos data
	totalTodos: number;
	completedTodos: number;
	pendingTodos: number;
	todosCompletionRate: number;

	// Dailies data
	totalDailies: number;
	completedDailies: number;
	availableDailies: number;
	dailiesCompletionRate: number;

	// Consolidated metrics
	totalTasks: number;
	completedTasks: number;
	overallCompletionRate: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function AnalyticsDashboard() {
	const { goals } = useGoals();
	const { data: todos } = useTodos();
	const { data: dailiesData } = useAvailableDailies();
	const [timeRange, setTimeRange] = useState<
		"week" | "month" | "quarter" | "year"
	>("month");
	const { data: habitsAnalytics } = useHabitsAnalytics(timeRange);
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

		// Todos analytics
		const filteredTodos = todos?.filter(
			(todo) => todo.createdAt >= startDate,
		) || [];
		const totalTodos = filteredTodos.length;
		const completedTodos = filteredTodos.filter(
			(todo) => todo.lastCompletedDate !== undefined,
		).length;
		const pendingTodos = totalTodos - completedTodos;
		const todosCompletionRate =
			totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

		// Dailies analytics
		const availableDailies = dailiesData?.availableDailies?.length || 0;
		const completedDailies = dailiesData?.completedToday?.length || 0;
		const totalDailies = availableDailies + completedDailies;
		const dailiesCompletionRate =
			totalDailies > 0 ? (completedDailies / totalDailies) * 100 : 0;

		// Consolidated metrics
		const totalTasks = totalGoals + totalTodos + totalDailies;
		const completedTasks = completedGoals + completedTodos + completedDailies;
		const overallCompletionRate =
			totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

		setAnalyticsData({
			totalGoals,
			completedGoals,
			inProgressGoals,
			overdueGoals,
			completionRate,
			averageCompletionTime: 0, // TODO: Implementar cálculo real
			goalsByPriority,
			weeklyProgress,
			monthlyTrends,
			totalTodos,
			completedTodos,
			pendingTodos,
			todosCompletionRate,
			totalDailies,
			completedDailies,
			availableDailies,
			dailiesCompletionRate,
			totalTasks,
			completedTasks,
			overallCompletionRate,
		});
	}, [timeRange, goals, todos, dailiesData]);

	useEffect(() => {
		if (goals.length > 0) {
			calculateAnalytics();
		}
	}, [calculateAnalytics]);

	const getStartDate = (range: string) => {
		const now = new Date();
		switch (range) {
			case "day":
				return new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
						<SelectItem value="day">Dia</SelectItem>
						<SelectItem value="week">Semana</SelectItem>
						<SelectItem value="month">Mês</SelectItem>
						<SelectItem value="quarter">Trimestre</SelectItem>
						<SelectItem value="year">Ano</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Consolidated Summary */}
			<div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Total de Tarefas
						</CardTitle>
						<Target className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{analyticsData.totalTasks}
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
							Taxas de Conclusão Geral
						</CardTitle>
						<CheckCircle className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{analyticsData.overallCompletionRate.toFixed(1)}%
						</div>
						<p className="text-muted-foreground text-xs">
							{analyticsData.completedTasks} de{" "}
							{analyticsData.totalTasks} concluídas
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Metas + Hábitos + Todos
						</CardTitle>
						<Clock className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{analyticsData.totalGoals + (habitsAnalytics?.totalHabits || 0) + analyticsData.totalTodos}
						</div>
						<p className="text-muted-foreground text-xs">
							Itens ativos no período
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Dailies Hoje
						</CardTitle>
						<AlertTriangle className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{analyticsData.dailiesCompletionRate.toFixed(1)}%
						</div>
						<p className="text-muted-foreground text-xs">
							{analyticsData.completedDailies} de{" "}
							{analyticsData.totalDailies} concluídos
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Category-specific Metrics */}
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
					<TabsTrigger value="categories">Resumo por Categoria</TabsTrigger>
					<TabsTrigger value="evolution">Evolução Temporal</TabsTrigger>
					<TabsTrigger value="habits">Hábitos</TabsTrigger>
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

				<TabsContent value="categories" className="space-y-4">
					{/* Goals Summary */}
					<div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle className="font-medium text-sm">
									Metas
								</CardTitle>
								<Target className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">
									{analyticsData.totalGoals}
								</div>
								<p className="text-muted-foreground text-xs">
									{analyticsData.completionRate.toFixed(1)}% concluídas
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle className="font-medium text-sm">
									Todos
								</CardTitle>
								<CheckCircle className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">
									{analyticsData.totalTodos}
								</div>
								<p className="text-muted-foreground text-xs">
									{analyticsData.todosCompletionRate.toFixed(1)}% concluídos
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle className="font-medium text-sm">
									Dailies
								</CardTitle>
								<Clock className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">
									{analyticsData.totalDailies}
								</div>
								<p className="text-muted-foreground text-xs">
									{analyticsData.dailiesCompletionRate.toFixed(1)}% concluídos
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle className="font-medium text-sm">
									Hábitos
								</CardTitle>
								<AlertTriangle className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">
									{habitsAnalytics?.totalHabits || 0}
								</div>
								<p className="text-muted-foreground text-xs">
									{habitsAnalytics?.completionRate.toFixed(1) || 0}% concluídos
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Category Comparison Chart */}
					<Card>
						<CardHeader>
							<CardTitle>Comparação por Categoria</CardTitle>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart
									data={[
										{
											category: "Metas",
											total: analyticsData.totalGoals,
											completed: analyticsData.completedGoals,
											rate: analyticsData.completionRate,
										},
										{
											category: "Todos",
											total: analyticsData.totalTodos,
											completed: analyticsData.completedTodos,
											rate: analyticsData.todosCompletionRate,
										},
										{
											category: "Dailies",
											total: analyticsData.totalDailies,
											completed: analyticsData.completedDailies,
											rate: analyticsData.dailiesCompletionRate,
										},
										{
											category: "Hábitos",
											total: habitsAnalytics?.totalHabits || 0,
											completed: habitsAnalytics?.activeHabits || 0,
											rate: habitsAnalytics?.completionRate || 0,
										},
									]}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="category" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="total" fill="#8884d8" name="Total" />
									<Bar dataKey="completed" fill="#00C49F" name="Concluídos" />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="evolution" className="space-y-4">
					<div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Evolução de Metas</CardTitle>
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

						<Card>
							<CardHeader>
								<CardTitle>Progresso Semanal Consolidado</CardTitle>
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
					</div>

					{habitsAnalytics && (
						<div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle>Evolução de Hábitos</CardTitle>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<LineChart data={habitsAnalytics.dailyProgress}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="date" />
											<YAxis />
											<Tooltip />
											<Line
												type="monotone"
												dataKey="entries"
												stroke="#8884d8"
												name="Entradas"
											/>
											<Line
												type="monotone"
												dataKey="target"
												stroke="#82ca9d"
												name="Meta"
											/>
										</LineChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Tendências Semanais de Hábitos</CardTitle>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<BarChart data={habitsAnalytics.weeklyTrends}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="week" />
											<YAxis />
											<Tooltip />
											<Bar
												dataKey="totalEntries"
												fill="#8884d8"
												name="Total de Entradas"
											/>
										</BarChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Overall Evolution Chart */}
					<Card>
						<CardHeader>
							<CardTitle>Evolução Geral do Sistema</CardTitle>
							<p className="text-muted-foreground text-sm">
								Comparação da evolução de todas as categorias ao longo do tempo
							</p>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={400}>
								<LineChart
									data={analyticsData.monthlyTrends.map((trend, index) => ({
										...trend,
										habitsEntries: habitsAnalytics?.weeklyTrends[index]?.totalEntries || 0,
										todosCompleted: Math.floor(analyticsData.totalTodos * (trend.completed / trend.goals || 0)),
										dailiesCompleted: Math.floor(analyticsData.totalDailies * 0.7), // Mock data for dailies
									}))}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="month" />
									<YAxis />
									<Tooltip />
									<Line
										type="monotone"
										dataKey="goals"
										stroke="#8884d8"
										name="Metas"
									/>
									<Line
										type="monotone"
										dataKey="completed"
										stroke="#00C49F"
										name="Metas Concluídas"
									/>
									<Line
										type="monotone"
										dataKey="habitsEntries"
										stroke="#FFBB28"
										name="Entradas de Hábitos"
									/>
									<Line
										type="monotone"
										dataKey="todosCompleted"
										stroke="#FF8042"
										name="Todos Concluídos"
									/>
									<Line
										type="monotone"
										dataKey="dailiesCompleted"
										stroke="#00C49F"
										name="Dailies Concluídos"
									/>
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="habits" className="space-y-4">
					{habitsAnalytics ? (
						<>
							{/* Key Metrics for Habits */}
							<div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Total de Hábitos
										</CardTitle>
										<Target className="w-4 h-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{habitsAnalytics.totalHabits}
										</div>
										<p className="text-muted-foreground text-xs">
											Hábitos criados
										</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Ativos
										</CardTitle>
										<Clock className="w-4 h-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{habitsAnalytics.activeHabits}
										</div>
										<p className="text-muted-foreground text-xs">
											Em andamento
										</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Total de Entradas
										</CardTitle>
										<CheckCircle className="w-4 h-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{habitsAnalytics.totalEntries}
										</div>
										<p className="text-muted-foreground text-xs">
											Registros realizados
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
											{habitsAnalytics.completionRate.toFixed(1)}%
										</div>
										<p className="text-muted-foreground text-xs">
											Hábitos concluídos
										</p>
									</CardContent>
								</Card>
							</div>

							{/* Habits Charts */}
							<div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>Progresso Diário</CardTitle>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer width="100%" height={300}>
											<LineChart data={habitsAnalytics.dailyProgress}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="date" />
												<YAxis />
												<Tooltip />
												<Line
													type="monotone"
													dataKey="entries"
													stroke="#8884d8"
													name="Entradas"
												/>
												<Line
													type="monotone"
													dataKey="target"
													stroke="#82ca9d"
													name="Meta"
												/>
											</LineChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Hábitos por Categoria</CardTitle>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer width="100%" height={300}>
											<PieChart>
												<Pie
													data={habitsAnalytics.habitsByCategory}
													cx="50%"
													cy="50%"
													labelLine={false}
													label={({ category, percent }) =>
														`${category} ${(percent * 100).toFixed(0)}%`
													}
													outerRadius={80}
													fill="#8884d8"
													dataKey="count"
												>
													{habitsAnalytics.habitsByCategory.map(
														(entry, index) => (
															<Cell
																key={entry.category}
																fill={COLORS[index % COLORS.length]}
															/>
														),
													)}
												</Pie>
												<Tooltip />
											</PieChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>
							</div>

							{/* Streaks and Weekly Trends */}
							<div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>Streaks Atuais</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{habitsAnalytics.currentStreaks.slice(0, 5).map((streak, index) => (
												<div key={streak.habitId} className="flex justify-between items-center">
													<span className="text-sm">{streak.habitTitle}</span>
													<span className="font-bold text-sm">{streak.streakDays} dias</span>
												</div>
											))}
											{habitsAnalytics.currentStreaks.length === 0 && (
												<p className="text-muted-foreground text-sm">Nenhum streak ativo</p>
											)}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Tendências Semanais</CardTitle>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer width="100%" height={300}>
											<BarChart data={habitsAnalytics.weeklyTrends}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="week" />
												<YAxis />
												<Tooltip />
												<Bar
													dataKey="totalEntries"
													fill="#8884d8"
													name="Total de Entradas"
												/>
											</BarChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>
							</div>
						</>
					) : (
						<div className="flex justify-center items-center h-64">
							<div className="text-center">
								<div className="mx-auto mb-4 border-purple-600 border-b-2 rounded-full w-8 h-8 animate-spin" />
								<p className="text-gray-600">Carregando analytics de hábitos...</p>
							</div>
						</div>
					)}
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
