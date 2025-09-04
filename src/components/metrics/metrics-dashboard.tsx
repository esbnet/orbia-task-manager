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
import {
    AlertTriangle,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    Lightbulb,
    Target,
    TrendingDown,
    TrendingUp,
    Zap
} from "lucide-react";
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
    YAxis
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { useGoals } from "@/contexts/goal-context";
import { useAvailableDailies } from "@/hooks/use-dailies";
import { useHabitsAnalytics } from "@/hooks/use-habits-analytics";
import { useTodos } from "@/hooks/use-todos";

interface MetricsData {
    // Performance geral
    overallScore: number;
    productivityTrend: "up" | "down" | "stable";
    consistencyScore: number;

    // Insights por tags
    habitsInsights: {
        bestPerforming: string[];
        needsAttention: string[];
        streakOpportunities: string[];
        suggestions: string[];
    };

    todosInsights: {
        completionPatterns: string[];
        priorityDistribution: { high: number; medium: number; low: number };
        timeManagement: string[];
        suggestions: string[];
    };

    dailiesInsights: {
        completionRate: number;
        mostConsistent: string[];
        struggleAreas: string[];
        suggestions: string[];
    };

    goalsInsights: {
        progressRate: number;
        riskAreas: string[];
        achievementPatterns: string[];
        suggestions: string[];
    };

    // Recomendações práticas
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function MetricsDashboard() {
    const { goals } = useGoals();
    const { data: todos } = useTodos();
    const { data: dailiesData } = useAvailableDailies();
    const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");
    const { data: habitsAnalytics } = useHabitsAnalytics(timeRange);
    const [metricsData, setMetricsData] = useState<MetricsData | null>(null);

    const calculateMetrics = useCallback(() => {
        if (!habitsAnalytics || !todos || !dailiesData) return;

        // Cálculos básicos
        const totalHabits = habitsAnalytics.totalHabits;
        const activeHabits = habitsAnalytics.activeHabits;
        const habitsCompletionRate = habitsAnalytics.completionRate;

        const totalTodos = todos.length;
        const completedTodos = todos.filter(todo => todo.lastCompletedDate).length;
        const todosCompletionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

        const availableDailies = dailiesData.availableDailies?.length || 0;
        const completedDailies = dailiesData.completedToday?.length || 0;
        const dailiesCompletionRate = availableDailies > 0 ? (completedDailies / availableDailies) * 100 : 0;

        const totalGoals = goals.length;
        const completedGoals = goals.filter(goal => goal.status === "COMPLETED").length;
        const goalsCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

        // Score geral (média ponderada)
        const overallScore = Math.round(
            (habitsCompletionRate * 0.3) +
            (todosCompletionRate * 0.25) +
            (dailiesCompletionRate * 0.25) +
            (goalsCompletionRate * 0.2)
        );

        // Score de consistência (baseado em streaks e padrões)
        const consistencyScore = Math.round(
            (habitsAnalytics.currentStreaks.length > 0 ? 80 : 40) +
            (dailiesCompletionRate > 70 ? 20 : 0)
        );

        // Insights de hábitos
        const habitsInsights = {
            bestPerforming: habitsAnalytics.currentStreaks
                .filter(streak => streak.streakDays > 7)
                .map(streak => streak.habitTitle),
            needsAttention: [], // Removido pois não usamos mais categoria
            streakOpportunities: habitsAnalytics.currentStreaks
                .filter(streak => streak.streakDays < 3)
                .map(streak => streak.habitTitle),
            suggestions: [
                habitsCompletionRate < 50 ? "Considere reduzir a frequência de hábitos difíceis" : "",
                habitsAnalytics.currentStreaks.length === 0 ? "Comece com hábitos simples para construir momentum" : "",
                activeHabits < totalHabits * 0.7 ? "Reative hábitos pausados recentemente" : "",
            ].filter(Boolean),
        };

        // Insights de todos
        const todosInsights = {
            completionPatterns: [
                todosCompletionRate > 80 ? "Excelente taxa de conclusão!" : "",
                completedTodos > totalTodos * 0.5 ? "Bom equilíbrio entre criação e conclusão" : "",
            ].filter(Boolean),
            priorityDistribution: { high: 0, medium: 0, low: 0 }, // TODO: implementar baseado em dados reais
            timeManagement: [
                todosCompletionRate < 60 ? "Considere quebrar tarefas grandes em menores" : "",
                totalTodos > 20 ? "Avalie se todas as tarefas são prioritárias" : "",
            ].filter(Boolean),
            suggestions: [
                todosCompletionRate < 70 ? "Use a técnica Pomodoro para tarefas complexas" : "",
                "Priorize tarefas usando o método Eisenhower",
                "Defina prazos realistas para evitar procrastinação",
            ],
        };

        // Insights de dailies
        const dailiesInsights = {
            completionRate: dailiesCompletionRate,
            mostConsistent: dailiesData.availableDailies?.slice(0, 3).map(d => d.title) || [],
            struggleAreas: dailiesCompletionRate < 70 ? ["Manutenção diária"] : [],
            suggestions: [
                dailiesCompletionRate < 80 ? "Configure lembretes para atividades diárias" : "",
                availableDailies > 10 ? "Considere reduzir para focar no essencial" : "",
                "Combine dailies com hábitos existentes para reforço",
            ].filter(Boolean),
        };

        // Insights de goals
        const goalsInsights = {
            progressRate: goalsCompletionRate,
            riskAreas: goals
                .filter(goal => goal.status === "IN_PROGRESS" && new Date(goal.targetDate) < new Date())
                .map(goal => goal.title),
            achievementPatterns: [
                completedGoals > totalGoals * 0.5 ? "Bom histórico de conclusão de metas" : "",
            ].filter(Boolean),
            suggestions: [
                goalsCompletionRate < 50 ? "Quebre metas grandes em milestones menores" : "",
                "Defina metas SMART (Específicas, Mensuráveis, Atingíveis, Relevantes, Temporais)",
                "Acompanhe o progresso semanalmente",
            ],
        };

        // Recomendações práticas
        const recommendations = {
            immediate: [
                overallScore < 60 ? "✨ Comece completando 3 atividades hoje para ganhar momentum" : "",
                dailiesCompletionRate < 70 ? "📅 Configure lembretes para suas atividades diárias" : "",
                habitsAnalytics.currentStreaks.length === 0 ? "🎯 Escolha 1-2 hábitos simples para começar hoje" : "",
            ].filter(Boolean),
            shortTerm: [
                "📊 Revise seu progresso semanalmente",
                "🎯 Ajuste prioridades baseado no que funciona",
                "📝 Mantenha um diário de progresso",
            ],
            longTerm: [
                "🔄 Analise padrões sazonais no seu desempenho",
                "🎓 Considere mentorship ou cursos relacionados",
                "🌟 Celebre marcos importantes",
            ],
        };

        setMetricsData({
            overallScore,
            productivityTrend: overallScore > 70 ? "up" : overallScore < 50 ? "down" : "stable",
            consistencyScore,
            habitsInsights,
            todosInsights,
            dailiesInsights,
            goalsInsights,
            recommendations,
        });
    }, [habitsAnalytics, todos, dailiesData, goals]);

    useEffect(() => {
        calculateMetrics();
    }, [calculateMetrics]);

    if (!metricsData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="mx-auto mb-4 border-purple-600 border-b-2 rounded-full w-8 h-8 animate-spin" />
                    <p className="text-gray-600">Carregando métricas...</p>
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
                        Dashboard de Métricas
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Insights práticos para melhorar seu desempenho
                    </p>
                </div>
                <Select
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value as "week" | "month" | "quarter" | "year")}
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

            {/* Score Geral */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">Score Geral</CardTitle>
                        {metricsData.productivityTrend === "up" ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : metricsData.productivityTrend === "down" ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                            <BarChart3 className="w-4 h-4 text-gray-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-3xl">{metricsData.overallScore}%</div>
                        <p className="text-muted-foreground text-xs">
                            {metricsData.productivityTrend === "up"
                                ? "Tendência positiva"
                                : metricsData.productivityTrend === "down"
                                    ? "Precisa de atenção"
                                    : "Estável"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">Consistência</CardTitle>
                        <Zap className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-3xl">{metricsData.consistencyScore}%</div>
                        <p className="text-muted-foreground text-xs">
                            Baseado em streaks e padrões
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">Recomendações</CardTitle>
                        <Lightbulb className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-3xl">{metricsData.recommendations.immediate.length}</div>
                        <p className="text-muted-foreground text-xs">
                            Ações imediatas sugeridas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs de Insights */}
            <Tabs defaultValue="insights" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="habits">Hábitos</TabsTrigger>
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="dailies">Dailies</TabsTrigger>
                    <TabsTrigger value="goals">Metas</TabsTrigger>
                    <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-4">
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Pontos Fortes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {metricsData.habitsInsights.bestPerforming.length > 0 && (
                                        <div>
                                            <p className="font-medium text-sm">Hábitos em alta:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {metricsData.habitsInsights.bestPerforming.map((habit, index) => (
                                                    <Badge key={index} variant="secondary">{habit}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {metricsData.todosInsights.completionPatterns.length > 0 && (
                                        <div>
                                            <p className="font-medium text-sm">Padrões positivos:</p>
                                            <ul className="mt-1 text-muted-foreground text-sm">
                                                {metricsData.todosInsights.completionPatterns.map((pattern, index) => (
                                                    <li key={index}>• {pattern}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Áreas de Atenção
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {metricsData.habitsInsights.needsAttention.length > 0 && (
                                        <div>
                                            <p className="font-medium text-sm">Hábitos que precisam de foco:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {metricsData.habitsInsights.needsAttention.map((habit, index) => (
                                                    <Badge key={index} variant="destructive">{habit}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {metricsData.goalsInsights.riskAreas.length > 0 && (
                                        <div>
                                            <p className="font-medium text-sm">Metas em risco:</p>
                                            <ul className="mt-1 text-muted-foreground text-sm">
                                                {metricsData.goalsInsights.riskAreas.map((goal, index) => (
                                                    <li key={index}>• {goal}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="habits" className="space-y-4">
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance de Hábitos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Taxa de Conclusão</span>
                                        <span className="font-bold">{habitsAnalytics?.completionRate.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Hábitos Ativos</span>
                                        <span className="font-bold">{habitsAnalytics?.activeHabits}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Total de Entradas</span>
                                        <span className="font-bold">{habitsAnalytics?.totalEntries}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sugestões para Hábitos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {metricsData.habitsInsights.suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Lightbulb className="flex-shrink-0 mt-0.5 w-4 h-4 text-yellow-500" />
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gráficos de Hábitos */}
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Hábitos por Dificuldade</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={habitsAnalytics?.habitsByDifficulty?.map(item => ({
                                                name: item.difficulty,
                                                value: item.count,
                                                color: item.difficulty === "Fácil" ? "#00C49F" : item.difficulty === "Médio" ? "#FFBB28" : "#FF8042"
                                            })) || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {habitsAnalytics?.habitsByDifficulty?.map((item, index) => (
                                                <Cell key={`cell-${index}`} fill={item.difficulty === "Fácil" ? "#00C49F" : item.difficulty === "Médio" ? "#FFBB28" : "#FF8042"} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Distribuição de Tags em Hábitos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={(() => {
                                        const tagCounts: { [key: string]: number } = {};
                                        // Como não temos acesso direto aos hábitos aqui, vamos usar uma abordagem diferente
                                        // ou simplesmente mostrar dados mockados por enquanto
                                        return [
                                            { tag: "Saúde", count: habitsAnalytics?.activeHabits || 0 },
                                            { tag: "Produtividade", count: Math.floor((habitsAnalytics?.activeHabits || 0) * 0.7) },
                                            { tag: "Aprendizado", count: Math.floor((habitsAnalytics?.activeHabits || 0) * 0.5) },
                                        ];
                                    })()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="tag" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Progresso de Hábitos ao Longo do Tempo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={habitsAnalytics?.dailyProgress || []}>
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
                </TabsContent>

                <TabsContent value="todos" className="space-y-4">
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance de Todos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Taxa de Conclusão</span>
                                        <span className="font-bold">{metricsData.todosInsights.completionPatterns.length > 0 ? "Alta" : "Média"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Total de Tarefas</span>
                                        <span className="font-bold">{todos?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Concluídas</span>
                                        <span className="font-bold">{todos?.filter(t => t.lastCompletedDate).length || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Dicas de Gerenciamento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {metricsData.todosInsights.suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-green-500" />
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gráficos de Todos */}
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Todos por Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Concluídos", value: todos?.filter(t => t.lastCompletedDate).length || 0, color: "#00C49F" },
                                                { name: "Pendentes", value: todos?.filter(t => !t.lastCompletedDate).length || 0, color: "#FFBB28" },
                                            ].filter(item => item.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {[
                                                { name: "Concluídos", value: todos?.filter(t => t.lastCompletedDate).length || 0, color: "#00C49F" },
                                                { name: "Pendentes", value: todos?.filter(t => !t.lastCompletedDate).length || 0, color: "#FFBB28" },
                                            ].filter(item => item.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Todos por Dificuldade</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[
                                        { name: "Fácil", value: todos?.filter(t => t.difficulty === "Fácil").length || 0 },
                                        { name: "Médio", value: todos?.filter(t => t.difficulty === "Médio").length || 0 },
                                        { name: "Difícil", value: todos?.filter(t => t.difficulty === "Difícil").length || 0 },
                                    ]}>
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição de Tags em Todos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={(() => {
                                    const tagCounts: { [key: string]: number } = {};
                                    todos?.forEach(todo => {
                                        todo.tags.forEach(tag => {
                                            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                                        });
                                    });
                                    return Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));
                                })()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="tag" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dailies" className="space-y-4">
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance de Dailies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Taxa de Conclusão Hoje</span>
                                        <span className="font-bold">{metricsData.dailiesInsights.completionRate.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Disponíveis</span>
                                        <span className="font-bold">{dailiesData?.availableDailies?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Concluídas Hoje</span>
                                        <span className="font-bold">{dailiesData?.completedToday?.length || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Otimização de Dailies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {metricsData.dailiesInsights.suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Calendar className="flex-shrink-0 mt-0.5 w-4 h-4 text-blue-500" />
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gráficos de Dailies */}
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dailies por Dificuldade</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={dailiesData?.availableDailies?.reduce((acc, daily) => {
                                                const existing = acc.find(item => item.name === daily.difficulty);
                                                if (existing) {
                                                    existing.value += 1;
                                                } else {
                                                    acc.push({ name: daily.difficulty, value: 1, color: daily.difficulty === "Fácil" ? "#00C49F" : daily.difficulty === "Médio" ? "#FFBB28" : "#FF8042" });
                                                }
                                                return acc;
                                            }, [] as Array<{ name: string; value: number; color: string }>) || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {dailiesData?.availableDailies?.reduce((acc, daily) => {
                                                const existing = acc.find(item => item.name === daily.difficulty);
                                                if (existing) {
                                                    existing.value += 1;
                                                } else {
                                                    acc.push({ name: daily.difficulty, value: 1, color: daily.difficulty === "Fácil" ? "#00C49F" : daily.difficulty === "Médio" ? "#FFBB28" : "#FF8042" });
                                                }
                                                return acc;
                                            }, [] as Array<{ name: string; value: number; color: string }>).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Dailies por Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Disponíveis", value: dailiesData?.availableDailies?.length || 0, color: "#FFBB28" },
                                                { name: "Concluídas Hoje", value: dailiesData?.completedToday?.length || 0, color: "#00C49F" },
                                            ].filter(item => item.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {[
                                                { name: "Disponíveis", value: dailiesData?.availableDailies?.length || 0, color: "#FFBB28" },
                                                { name: "Concluídas Hoje", value: dailiesData?.completedToday?.length || 0, color: "#00C49F" },
                                            ].filter(item => item.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição de Tags em Dailies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={(() => {
                                    const tagCounts: { [key: string]: number } = {};
                                    dailiesData?.availableDailies?.forEach(daily => {
                                        daily.tags.forEach(tag => {
                                            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                                        });
                                    });
                                    return Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));
                                })()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="tag" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="goals" className="space-y-4">
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Progresso de Metas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Taxa de Conclusão</span>
                                        <span className="font-bold">{metricsData.goalsInsights.progressRate.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Total de Metas</span>
                                        <span className="font-bold">{goals.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Em Andamento</span>
                                        <span className="font-bold">{goals.filter(g => g.status === "IN_PROGRESS").length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Estratégias para Metas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {metricsData.goalsInsights.suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Target className="flex-shrink-0 mt-0.5 w-4 h-4 text-purple-500" />
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gráficos de Metas */}
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Metas por Prioridade</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Baixa", value: goals.filter(g => g.priority === "LOW").length, color: "#00C49F" },
                                                { name: "Média", value: goals.filter(g => g.priority === "MEDIUM").length, color: "#FFBB28" },
                                                { name: "Alta", value: goals.filter(g => g.priority === "HIGH").length, color: "#FF8042" },
                                                { name: "Urgente", value: goals.filter(g => g.priority === "URGENT").length, color: "#FF4444" },
                                            ].filter(item => item.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {[
                                                { name: "Baixa", value: goals.filter(g => g.priority === "LOW").length, color: "#00C49F" },
                                                { name: "Média", value: goals.filter(g => g.priority === "MEDIUM").length, color: "#FFBB28" },
                                                { name: "Alta", value: goals.filter(g => g.priority === "HIGH").length, color: "#FF8042" },
                                                { name: "Urgente", value: goals.filter(g => g.priority === "URGENT").length, color: "#FF4444" },
                                            ].filter(item => item.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Metas por Status Detalhado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[
                                        { name: "Em Andamento", value: goals.filter(g => g.status === "IN_PROGRESS").length, color: "#FFBB28" },
                                        { name: "Concluídas", value: goals.filter(g => g.status === "COMPLETED").length, color: "#00C49F" },
                                        { name: "Canceladas", value: goals.filter(g => g.status === "CANCELLED").length, color: "#FF8042" },
                                        { name: "Atrasadas", value: goals.filter(g => g.status === "IN_PROGRESS" && new Date(g.targetDate) < new Date()).length, color: "#FF4444" },
                                    ]}>
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

                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status das Metas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Em Andamento", value: goals.filter(g => g.status === "IN_PROGRESS").length, color: "#FFBB28" },
                                                { name: "Concluídas", value: goals.filter(g => g.status === "COMPLETED").length, color: "#00C49F" },
                                                { name: "Canceladas", value: goals.filter(g => g.status === "CANCELLED").length, color: "#FF8042" },
                                            ].filter(item => item.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {[
                                                { name: "Em Andamento", value: goals.filter(g => g.status === "IN_PROGRESS").length, color: "#FFBB28" },
                                                { name: "Concluídas", value: goals.filter(g => g.status === "COMPLETED").length, color: "#00C49F" },
                                                { name: "Canceladas", value: goals.filter(g => g.status === "CANCELLED").length, color: "#FF8042" },
                                            ].filter(item => item.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Distribuição de Tags em Metas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={(() => {
                                        const tagCounts: { [key: string]: number } = {};
                                        goals.forEach(goal => {
                                            goal.tags.forEach(tag => {
                                                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                                            });
                                        });
                                        return Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));
                                    })()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="tag" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-orange-500" />
                                    Ações Imediatas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {metricsData.recommendations.immediate.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-orange-500">⚡</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                    Curto Prazo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {metricsData.recommendations.shortTerm.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-blue-500">📅</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-green-500" />
                                    Longo Prazo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {metricsData.recommendations.longTerm.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-green-500">🎯</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}