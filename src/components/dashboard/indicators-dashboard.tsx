"use client";

import {
    BarChart3,
    Calendar,
    CheckCircle,
    Flame,
    Target,
    Trophy,
    Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
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

import { useActiveTasks } from "@/hooks/use-active-tasks";
import { useAvailableDailies } from "@/hooks/use-dailies";
import { useGoals } from "@/contexts/goal-context";
import { useHabits } from "@/hooks/use-habits";
import { useHabitsAnalytics } from "@/hooks/use-habits-analytics";
import { useMemo } from "react";
import { useTodos } from "@/hooks/use-todos";

export function IndicatorsDashboard() {
    const { data: habits } = useHabits();
    const { data: habitsAnalytics } = useHabitsAnalytics("week");
    const { data: dailiesData } = useAvailableDailies();
    const { data: todos } = useTodos();
    const { goals } = useGoals();
    const { data: activeTasks } = useActiveTasks();

    // Cálculos para o resumo do dia
    const dailySummary = useMemo(() => {
        const completedTodos = todos?.filter(todo => todo.lastCompletedDate)?.length || 0;
        const totalTodos = todos?.length || 0;
        const completedDailies = dailiesData?.completedToday?.length || 0;
        const totalDailies = dailiesData?.availableDailies?.length || 0;

        // Calcular pontuação baseada em conclusão
        const todoPoints = completedTodos * 10;
        const dailyPoints = completedDailies * 15;
        const habitPoints = habitsAnalytics?.currentStreaks?.reduce((sum, streak) =>
            sum + Math.min(streak.streakDays, 7), 0) || 0;

        const totalPoints = todoPoints + dailyPoints + habitPoints;

        // Calcular streak ativo (mínimo dos streaks atuais)
        const activeStreak = habitsAnalytics?.currentStreaks && habitsAnalytics.currentStreaks.length > 0
            ? Math.min(...habitsAnalytics.currentStreaks.map(s => s.streakDays))
            : 0;

        return {
            completedTasks: completedTodos + completedDailies,
            totalTasks: totalTodos + totalDailies,
            dailyScore: totalPoints,
            activeStreak,
            completionRate: totalTodos + totalDailies > 0
                ? ((completedTodos + completedDailies) / (totalTodos + totalDailies)) * 100
                : 0
        };
    }, [todos, dailiesData, habitsAnalytics]);

    // Dados para gráficos de hábitos
    const habitsChartData = useMemo(() => {
        if (!habitsAnalytics?.dailyProgress) return [];

        return habitsAnalytics.dailyProgress.slice(-7).map(day => ({
            date: new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
            habits: day.entries,
            target: day.target
        }));
    }, [habitsAnalytics]);

    // Dados para gráfico de afazeres
    const todosChartData = useMemo(() => {
        const completed = todos?.filter(todo => todo.lastCompletedDate).length || 0;
        const pending = todos?.filter(todo => !todo.lastCompletedDate).length || 0;

        return [
            { name: 'Concluídos', value: completed, color: '#10b981' },
            { name: 'Pendentes', value: pending, color: '#f59e0b' }
        ].filter(item => item.value > 0);
    }, [todos]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-gray-900 dark:text-gray-100 text-2xl">
                        Dashboard de Indicadores
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Acompanhe seu progresso e conquistas diárias
                    </p>
                </div>
            </div>

            {/* 🔥 Seção 1 — Resumo do Dia */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-blue-600 text-sm">Tarefas Hoje</p>
                                <p className="font-bold text-blue-900 text-2xl">
                                    {dailySummary.completedTasks} / {dailySummary.totalTasks}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Zap className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-600 text-sm">Pontuação</p>
                                <p className="font-bold text-green-900 text-2xl">
                                    {dailySummary.dailyScore} pts
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <Flame className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="font-medium text-orange-600 text-sm">Streak Ativo</p>
                                <p className="font-bold text-orange-900 text-2xl">
                                    {dailySummary.activeStreak} dias
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Target className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-purple-600 text-sm">Progresso</p>
                                <p className="font-bold text-purple-900 text-2xl">
                                    {dailySummary.completionRate.toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mensagem motivacional */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                            <Trophy className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-yellow-800">
                                {dailySummary.completionRate >= 80
                                    ? "🎉 Parabéns! Você está arrasando hoje!"
                                    : dailySummary.completionRate >= 60
                                        ? "🚀 Você está no caminho certo! Continue assim!"
                                        : "💪 Cada passo conta! Vamos completar mais tarefas hoje!"}
                            </p>
                            <p className="mt-1 text-yellow-600 text-sm">
                                {dailySummary.totalTasks - dailySummary.completedTasks > 0
                                    ? `Faltam ${dailySummary.totalTasks - dailySummary.completedTasks} tarefas para fechar o dia 100%!`
                                    : "Dia perfeito! Todas as tarefas concluídas! 🎯"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 📅 Seção 2 — Hábitos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Hábitos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                            <div className="text-center">
                                <p className="font-bold text-blue-600 text-2xl">
                                    {habitsAnalytics?.currentStreaks?.[0]?.streakDays || 0}
                                </p>
                                <p className="text-gray-600 text-sm">Dias seguidos</p>
                                <p className="text-gray-500 text-xs">
                                    {habitsAnalytics?.currentStreaks?.[0]?.habitTitle || "Nenhum"}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-green-600 text-2xl">
                                    {habitsAnalytics?.completionRate.toFixed(1)}%
                                </p>
                                <p className="text-gray-600 text-sm">Taxa de conclusão</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-purple-600 text-2xl">
                                    {habitsAnalytics?.activeHabits || 0}
                                </p>
                                <p className="text-gray-600 text-sm">Hábitos ativos</p>
                            </div>
                        </div>

                        {/* Gráfico de hábitos */}
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={habitsChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="habits"
                                        stroke="#3b82f6"
                                        name="Hábitos"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="target"
                                        stroke="#10b981"
                                        name="Meta"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ✅ Seção 3 — Diárias */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-500" />
                        Diárias
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                        <div className="text-center">
                            <p className="font-bold text-green-600 text-2xl">
                                {dailiesData?.completedToday?.length || 0} / {dailiesData?.availableDailies?.length || 0}
                            </p>
                            <p className="text-gray-600 text-sm">Concluídas hoje</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-blue-600 text-2xl">
                                {dailiesData?.availableDailies && dailiesData.availableDailies.length > 0
                                    ? ((dailiesData?.completedToday?.length || 0) / dailiesData.availableDailies.length * 100).toFixed(0)
                                    : 0}%
                            </p>
                            <p className="text-gray-600 text-sm">Taxa de conclusão</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-purple-600 text-2xl">
                                {dailiesData?.availableDailies?.length || 0}
                            </p>
                            <p className="text-gray-600 text-sm">Diárias ativas</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 📌 Seção 4 — Afazeres */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-orange-500" />
                        Afazeres
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                        <div className="text-center">
                            <p className="font-bold text-orange-600 text-2xl">
                                {todos?.filter(todo => todo.lastCompletedDate).length || 0}
                            </p>
                            <p className="text-gray-600 text-sm">Concluídos na semana</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-red-600 text-2xl">
                                {todos?.filter(todo => !todo.lastCompletedDate).length || 0}
                            </p>
                            <p className="text-gray-600 text-sm">Pendentes</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-blue-600 text-2xl">
                                {todos && todos.length > 0
                                    ? ((todos.filter(todo => todo.lastCompletedDate).length || 0) / todos.length * 100).toFixed(0)
                                    : 0}%
                            </p>
                            <p className="text-gray-600 text-sm">Taxa de conclusão</p>
                        </div>
                    </div>

                    {/* Gráfico de pizza para afazeres */}
                    <div className="mt-6 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={todosChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {todosChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 🎯 Seção 5 — Metas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-500" />
                        Metas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                        <div className="text-center">
                            <p className="font-bold text-purple-600 text-2xl">
                                {goals.filter(goal => goal.status === "IN_PROGRESS").length}
                            </p>
                            <p className="text-gray-600 text-sm">Metas ativas</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-green-600 text-2xl">
                                {goals.filter(goal => goal.status === "COMPLETED").length}
                            </p>
                            <p className="text-gray-600 text-sm">Concluídas</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-blue-600 text-2xl">
                                {goals.length > 0
                                    ? ((goals.filter(goal => goal.status === "COMPLETED").length) / goals.length * 100).toFixed(0)
                                    : 0}%
                            </p>
                            <p className="text-gray-600 text-sm">Taxa de sucesso</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 🏆 Seção 6 — Gamificação */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Gamificação
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="font-bold text-yellow-600 text-3xl">
                                Nível {Math.floor(dailySummary.dailyScore / 100) + 1}
                            </p>
                            <p className="text-yellow-700">
                                Construtor de Rotina
                            </p>
                            <p className="mt-2 text-yellow-600 text-sm">
                                {dailySummary.dailyScore % 100}/100 pontos para o próximo nível
                            </p>
                        </div>

                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                            <div className="bg-white p-4 border rounded-lg">
                                <h4 className="mb-2 font-medium text-gray-900">🏅 Medalhas Recentes</h4>
                                <ul className="space-y-1 text-gray-600 text-sm">
                                    {dailySummary.activeStreak >= 5 && (
                                        <li>• 5 dias perfeitos seguidos</li>
                                    )}
                                    {dailySummary.completionRate >= 80 && (
                                        <li>• Dia quase perfeito!</li>
                                    )}
                                    {goals.filter(goal => goal.status === "COMPLETED").length > 0 && (
                                        <li>• Primeira meta concluída</li>
                                    )}
                                    {habitsAnalytics?.completionRate && habitsAnalytics.completionRate >= 70 && (
                                        <li>• Hábito consistente</li>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-white p-4 border rounded-lg">
                                <h4 className="mb-2 font-medium text-gray-900">🎯 Próximas Conquistas</h4>
                                <ul className="space-y-1 text-gray-600 text-sm">
                                    {dailySummary.activeStreak < 7 && (
                                        <li>• 7 dias seguidos ({7 - dailySummary.activeStreak} dias restantes)</li>
                                    )}
                                    {dailySummary.completionRate < 100 && (
                                        <li>• Dia 100% perfeito</li>
                                    )}
                                    {goals.filter(goal => goal.status === "COMPLETED").length < 5 && (
                                        <li>• 5 metas concluídas</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}