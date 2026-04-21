"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Award,
    BarChart3,
    CheckCircle,
    Flame,
    Target,
    Trophy
} from "lucide-react";
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

import { useGoals } from "@/contexts/goal-context";
import { useHabitsAnalytics } from "@/hooks/use-habits-analytics";
import { useTodos } from "@/hooks/use-todos";
import { useMemo } from "react";

export function IndicatorsDashboard() {
    const { data: habitsAnalytics } = useHabitsAnalytics("week");
    const { data: todos } = useTodos();
    const { goals } = useGoals();


    // Cálculos aprimorados para o resumo do dia usando dados do banco
    const dailySummary = useMemo(() => {
        // Dados de todos - usar todas as tarefas ativas (não concluídas) para exibição,
        // mas calcular métricas baseadas em tarefas recentes para precisão
        const allTodos = todos || [];
        const activeTodos = allTodos.filter(todo => !todo.lastCompletedDate); // Tarefas não concluídas
        const recentTodos = allTodos.filter(todo => {
            const createdDate = new Date(todo.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate >= weekAgo;
        }) || [];

        const completedTodos = recentTodos.filter(todo => todo.lastCompletedDate).length;
        const totalTodos = recentTodos.length;
        const pendingTodos = activeTodos.length; // Mostrar tarefas ativas pendentes

        // Dados de hábitos - usar analytics do banco para maior precisão
        const activeHabits = habitsAnalytics?.activeHabits || 0;
        const habitCompletionRate = habitsAnalytics?.completionRate || 0;

        // Dados de metas - calcular métricas baseadas em atividades reais
        const completedGoals = goals.filter(goal => goal.status === "COMPLETED");
        const inProgressGoals = goals.filter(goal => goal.status === "IN_PROGRESS");
        const totalGoals = goals.length;
        const completedGoalsRate = totalGoals > 0 ? (completedGoals.length / totalGoals) * 100 : 0;

        // Calcular pontuação mais precisa baseada em dificuldade e importância
        const todoPoints = recentTodos.reduce((sum, todo) => {
            const isCompleted = !!todo.lastCompletedDate;
            const difficultyMultiplier = todo.difficulty === 'Difícil' ? 3 :
                todo.difficulty === 'Médio' ? 2 : 1;
            return sum + (isCompleted ? 10 * difficultyMultiplier : 0);
        }, 0);

        // Pontos de hábitos baseados em streaks e consistência
        const habitPoints = habitsAnalytics?.currentStreaks?.reduce((sum, streak) => {
            const streakBonus = Math.min(streak.streakDays, 30); // Máximo 30 dias de bônus
            return sum + (streakBonus * 5);
        }, 0) || 0;

        // Pontos de metas baseados em conclusão e prioridade
        const goalPoints = completedGoals.reduce((sum, goal) => {
            const priorityMultiplier = goal.priority === 'URGENT' ? 4 :
                goal.priority === 'HIGH' ? 3 :
                    goal.priority === 'MEDIUM' ? 2 : 1;
            return sum + (25 * priorityMultiplier);
        }, 0);

        // Bônus por completar todas as tarefas do dia (incluindo metas)
        const allTasksCompleted = (completedTodos === totalTodos && totalTodos > 0) || completedGoals.length > 0;
        const completionBonus = allTasksCompleted ? 50 : 0;

        const totalPoints = todoPoints + habitPoints + goalPoints + completionBonus;

        // Calcular streak universal baseado em todos os tipos de tarefas
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Coletar todas as datas de atividades dos 4 tipos de tarefas
        const activityDates: Date[] = [];

        // 1. Todos concluídos (última conclusão)
        const completedTodosList = allTodos.filter(todo => todo.lastCompletedDate);
        completedTodosList.forEach(todo => {
            const completedDate = new Date(todo.lastCompletedDate!);
            completedDate.setHours(0, 0, 0, 0);
            if (!activityDates.some(date => date.getTime() === completedDate.getTime())) {
                activityDates.push(completedDate);
            }
        });

        // 2. Hábitos (dos streaks existentes)
        if (habitsAnalytics?.currentStreaks) {
            habitsAnalytics.currentStreaks.forEach(streak => {
                // Adicionar os últimos dias do streak
                for (let i = 0; i < streak.streakDays; i++) {
                    const streakDate = new Date(today);
                    streakDate.setDate(streakDate.getDate() - i);
                    if (!activityDates.some(date => date.getTime() === streakDate.getTime())) {
                        activityDates.push(streakDate);
                    }
                }
            });
        }

        // 3. Metas concluídas
        completedGoals.forEach(goal => {
            const completedDate = new Date(goal.updatedAt);
            completedDate.setHours(0, 0, 0, 0);
            if (!activityDates.some(date => date.getTime() === completedDate.getTime())) {
                activityDates.push(completedDate);
            }
        });

        // Ordenar as datas
        activityDates.sort((a, b) => b.getTime() - a.getTime());

        // Calcular o streak
        let activeStreak = 0;
        let currentDate = new Date(today);

        for (const activityDate of activityDates) {
            if (activityDate.getTime() === currentDate.getTime()) {
                activeStreak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (activityDate.getTime() === yesterday.getTime() && activeStreak === 0) {
                // Se não teve atividade hoje mas teve ontem, streak = 1
                activeStreak = 1;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Taxa de conclusão ponderada por tipo de tarefa (incluindo metas)
        const weightedCompletionRate = (() => {
            const todoWeight = 0.4;
            const habitWeight = 0.3;
            const goalWeight = 0.3;

            const todoRate = totalTodos > 0 ? (completedTodos / totalTodos) : 0;
            const habitRate = habitCompletionRate / 100;
            const goalRate = completedGoalsRate / 100;

            return (todoRate * todoWeight + habitRate * habitWeight + goalRate * goalWeight) * 100;
        })();

        // Calcular produtividade geral baseada em atividades reais
        const generalProductivity = (() => {
            const totalActivities = completedTodos + completedGoals.length;
            const totalPossibleActivities = totalTodos + totalGoals;
            return totalPossibleActivities > 0 ? (totalActivities / totalPossibleActivities) * 100 : 0;
        })();

        // Calcular métricas gerais incluindo todas as tarefas ativas
        const allActiveTodos = allTodos.filter(todo => !todo.lastCompletedDate).length;
        const totalActiveTasks = allActiveTodos;

        return {
            completedTasks: completedTodos,
            totalTasks: totalTodos, // Métricas baseadas em tarefas recentes
            pendingTasks: totalActiveTasks, // Mostrar tarefas ativas pendentes
            dailyScore: totalPoints,
            activeStreak,
            completionRate: weightedCompletionRate,
            generalProductivity,
            completedGoals,
            inProgressGoals,
            breakdown: {
                todos: { completed: completedTodos, total: totalTodos, rate: totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0 },
                habits: { active: activeHabits, completionRate: habitCompletionRate },
                goals: { completed: completedGoals.length, total: totalGoals, rate: completedGoalsRate }
            }
        };
    }, [todos, habitsAnalytics, goals]);

    // Dados para gráficos de hábitos
    const habitsChartData = useMemo(() => {
        if (!habitsAnalytics?.dailyProgress) return [];

        return habitsAnalytics.dailyProgress.slice(-7).map(day => ({
            date: new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
            habits: day.entries,
            target: day.target
        }));
    }, [habitsAnalytics]);

    // Dados para gráfico de tarefa - mostrar todas as tarefas ativas
    const todosChartData = useMemo(() => {
        const allTodos = todos || [];
        const completed = allTodos.filter(todo => todo.lastCompletedDate).length;
        const pending = allTodos.filter(todo => !todo.lastCompletedDate).length;

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
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                <Card className="bg-gradient-to-br from-slate-50 to-slate-100 hover:shadow-md border-slate-200 transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-200 p-3 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-slate-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-600 text-sm">Tarefas Hoje</p>
                                <p className="font-bold text-slate-900 text-2xl">
                                    {dailySummary.completedTasks} / {dailySummary.totalTasks}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-md border-amber-200 transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-200 p-3 rounded-xl">
                                <Award className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium text-amber-600 text-sm">Pontuação</p>
                                <p className="font-bold text-amber-900 text-2xl">
                                    {dailySummary.dailyScore} pts
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-md border-orange-200 transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-200 p-3 rounded-xl">
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

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-md border-emerald-200 transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-200 p-3 rounded-xl">
                                <BarChart3 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-medium text-emerald-600 text-sm">Progresso</p>
                                <p className="font-bold text-emerald-900 text-2xl">
                                    {dailySummary.completionRate.toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md border-purple-200 transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-200 p-3 rounded-xl">
                                <Target className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-purple-600 text-sm">Produtividade</p>
                                <p className="font-bold text-purple-900 text-2xl">
                                    {dailySummary.generalProductivity.toFixed(0)}%
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
                                {dailySummary.completionRate >= 85
                                    ? "🎉 Excelente! Você está dominando suas rotinas!"
                                    : dailySummary.completionRate >= 70
                                        ? "🚀 Muito bom! Continue com esse ritmo!"
                                        : dailySummary.completionRate >= 50
                                            ? "💪 Bom progresso! Vamos aumentar um pouco mais!"
                                            : "🎯 Cada pequena vitória conta! Vamos começar!"}
                            </p>
                            <p className="mt-1 text-yellow-600 text-sm">
                                {dailySummary.pendingTasks > 0
                                    ? `Você tem ${dailySummary.pendingTasks} tarefa${dailySummary.pendingTasks !== 1 ? 's' : ''} ativa${dailySummary.pendingTasks !== 1 ? 's' : ''} pendente${dailySummary.pendingTasks !== 1 ? 's' : ''}. Continue assim! 💪`
                                    : "Incrível! Todas as tarefas ativas foram concluídas! 🎯"}
                            </p>
                            <div className="flex flex-wrap gap-4 mt-2 text-yellow-700 text-xs">
                                <span>✅ Todos: {dailySummary.breakdown.todos.completed}/{dailySummary.breakdown.todos.total}</span>
                                <span>🏃 Hábitos: {dailySummary.breakdown.habits.completionRate.toFixed(0)}%</span>
                                <span>🎯 Metas: {dailySummary.breakdown.goals.completed}/{dailySummary.breakdown.goals.total}</span>
                            </div>
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

            {/* 📌 Seção 4 — Tarefa */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-orange-500" />
                        Tarefa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                        <div className="text-center">
                            <p className="font-bold text-orange-600 text-2xl">
                                {todos?.filter(todo => todo.lastCompletedDate).length || 0}
                            </p>
                            <p className="text-gray-600 text-sm">Total concluídos</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-red-600 text-2xl">
                                {todos?.filter(todo => !todo.lastCompletedDate).length || 0}
                            </p>
                            <p className="text-gray-600 text-sm">Ativos pendentes</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-blue-600 text-2xl">
                                {todos && todos.length > 0
                                    ? ((todos.filter(todo => todo.lastCompletedDate).length || 0) / todos.length * 100).toFixed(0)
                                    : 0}%
                            </p>
                            <p className="text-gray-600 text-sm">Taxa geral</p>
                        </div>
                    </div>

                    {/* Gráfico de pizza para tarefa */}
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
                                Nível {Math.floor(dailySummary.dailyScore / 150) + 1}
                            </p>
                            <p className="text-yellow-700">
                                {dailySummary.dailyScore >= 500 ? "Mestre da Produtividade" :
                                    dailySummary.dailyScore >= 300 ? "Especialista em Hábitos" :
                                        dailySummary.dailyScore >= 150 ? "Construtor de Rotina" : "Iniciante Produtivo"}
                            </p>
                            <p className="mt-2 text-yellow-600 text-sm">
                                {dailySummary.dailyScore % 150}/150 pontos para o próximo nível
                            </p>
                            <div className="flex justify-center gap-4 mt-2 text-yellow-700 text-xs">
                                <span>Streak: {dailySummary.activeStreak} dias</span>
                                <span>Taxa: {dailySummary.completionRate.toFixed(0)}%</span>
                            </div>
                        </div>

                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                            <div className="bg-white p-4 border rounded-lg">
                                <h4 className="mb-2 font-medium text-gray-900">🏅 Conquistas Recentes</h4>
                                <ul className="space-y-1 text-gray-600 text-sm">
                                    {dailySummary.activeStreak >= 7 && (
                                        <li>• 🔥 Mestre dos Streaks (7+ dias)</li>
                                    )}
                                    {dailySummary.activeStreak >= 5 && dailySummary.activeStreak < 7 && (
                                        <li>• 🔥 5 dias perfeitos seguidos</li>
                                    )}
                                    {dailySummary.completionRate >= 90 && (
                                        <li>• 🎯 Dia quase perfeito! (90%+)</li>
                                    )}
                                    {dailySummary.completionRate >= 80 && dailySummary.completionRate < 90 && (
                                        <li>• 💪 Dia produtivo! (80%+)</li>
                                    )}
                                    {/* Conquistas baseadas nos 4 tipos de tarefas */}
                                    {dailySummary.completedGoals.length >= 3 && (
                                        <li>• 🎯 Conquistador de Metas (3+ concluídas)</li>
                                    )}
                                    {dailySummary.completedGoals.length > 0 && dailySummary.completedGoals.length < 3 && (
                                        <li>• 🎯 Primeira meta concluída</li>
                                    )}
                                    {habitsAnalytics?.completionRate && habitsAnalytics.completionRate >= 80 && (
                                        <li>• 🏃 Hábito excepcional (80%+)</li>
                                    )}
                                    {habitsAnalytics?.completionRate && habitsAnalytics.completionRate >= 70 &&
                                        habitsAnalytics.completionRate < 80 && (
                                            <li>• 🏃 Hábito consistente (70%+)</li>
                                        )}
                                    {dailySummary.breakdown.todos.completed >= 5 && (
                                        <li>• ✅ Mestre das Tarefas (5+ concluídas)</li>
                                    )}
                                    {dailySummary.breakdown.todos.completed > 0 && dailySummary.breakdown.todos.completed < 5 && (
                                        <li>• ✅ Primeira tarefa concluída</li>
                                    )}
                                    {dailySummary.completedGoals.length >= 1 && dailySummary.inProgressGoals.length >= 2 && (
                                        <li>• 🎯 Equilibrista (1+ meta + 2+ ativas)</li>
                                    )}
                                </ul>
                                {(!dailySummary.activeStreak || dailySummary.activeStreak < 5) &&
                                    dailySummary.completionRate < 80 &&
                                    goals.filter(goal => goal.status === "COMPLETED").length === 0 && (
                                        <p className="mt-2 text-gray-500 text-xs italic">Continue praticando para desbloquear medalhas! 💪</p>
                                    )}
                            </div>

                            <div className="bg-white p-4 border rounded-lg">
                                <h4 className="mb-2 font-medium text-gray-900">🎯 Próximas Conquistas</h4>
                                <ul className="space-y-1 text-gray-600 text-sm">
                                    {dailySummary.activeStreak < 7 && (
                                        <li>• 🔥 7 dias seguidos (+{7 - dailySummary.activeStreak} dias)</li>
                                    )}
                                    {dailySummary.activeStreak < 5 && dailySummary.activeStreak >= 3 && (
                                        <li>• 🔥 5 dias perfeitos (+{5 - dailySummary.activeStreak} dias)</li>
                                    )}
                                    {dailySummary.completionRate < 90 && (
                                        <li>• 🎯 Dia 90% perfeito (+{Math.ceil(90 - dailySummary.completionRate)}%)</li>
                                    )}
                                    {dailySummary.completionRate < 100 && dailySummary.completionRate >= 90 && (
                                        <li>• 🎯 Dia 100% perfeito (+{Math.ceil(100 - dailySummary.completionRate)}%)</li>
                                    )}
                                    {goals.filter(goal => goal.status === "COMPLETED").length < 5 && (
                                        <li>• 🎯 5 metas concluídas (+{5 - goals.filter(goal => goal.status === "COMPLETED").length} restantes)</li>
                                    )}
                                    {goals.filter(goal => goal.status === "COMPLETED").length < 3 &&
                                        goals.filter(goal => goal.status === "COMPLETED").length > 0 && (
                                            <li>• 🎯 3 metas concluídas (+{3 - goals.filter(goal => goal.status === "COMPLETED").length} restantes)</li>
                                        )}
                                    {habitsAnalytics?.completionRate && habitsAnalytics.completionRate < 80 && (
                                        <li>• 🏃 Hábito excepcional (+{Math.ceil(80 - habitsAnalytics.completionRate)}%)</li>
                                    )}
                                </ul>
                                {dailySummary.activeStreak >= 7 &&
                                    dailySummary.completionRate >= 90 &&
                                    goals.filter(goal => goal.status === "COMPLETED").length >= 5 && (
                                        <p className="mt-2 text-green-600 text-xs italic">🎉 Você desbloqueou todas as conquistas básicas! Continue evoluindo! 🚀</p>
                                    )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}