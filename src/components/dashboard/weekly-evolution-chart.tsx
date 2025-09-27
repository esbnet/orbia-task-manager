"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
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
    ChartTooltip
} from "@/components/ui/chart";
import { useDailies } from "@/hooks/use-dailies";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { useGoals } from "@/hooks/use-goals";
import { useHabitPeriods } from "@/hooks/use-habit-periods";
import { useHabits } from "@/hooks/use-habits";
import { useTodoLogs } from "@/hooks/use-todo-logs";
import { useTodos } from "@/hooks/use-todos";
import type { Goal } from "@/types/goal";
import { useMemo } from "react";

const chartConfig = {
    habits: {
        label: "Hábitos",
        color: "hsl(var(--chart-2, 160 60% 45%))",
    },
    dailies: {
        label: "Diárias",
        color: "hsl(var(--chart-3, 30 80% 55%))",
    },
    todos: {
        label: "Tarefas",
        color: "hsl(var(--chart-1, 220 70% 50%))",
    },
    goals: {
        label: "Metas",
        color: "hsl(var(--chart-4, 280 65% 60%))",
    },
    total: {
        label: "Total",
        color: "hsl(var(--muted-foreground, 220 9% 46%))",
    },
} satisfies ChartConfig;

// Tipos para os logs
interface HabitPeriod {
    id: string;
    habitId: string;
    periodType: string;
    startDate: Date;
    endDate?: Date;
    count: number;
    target?: number;
    isActive: boolean;
    habit: {
        title: string;
        difficulty: string;
        tags: string[];
    };
    HabitEntry: {
        timestamp: Date;
    }[];
}

interface DailyLog {
    id: string;
    dailyId: string;
    periodId?: string;
    dailyTitle: string;
    completedAt: Date;
    difficulty: string;
    tags: string[];
    createdAt: Date;
}

interface TodoLog {
    id: string;
    todoId: string;
    todoTitle: string;
    completedAt: Date;
    difficulty: string;
    tags: string[];
    createdAt: Date;
}

// Componente personalizado para o tooltip
function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const date = new Date(data.date);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'short'
        });

        return (
            <div className="bg-background shadow-lg p-3 border border-border rounded-lg max-w-xs">
                <p className="mb-2 font-bold text-foreground">{formattedDate}</p>

                {payload.map((entry: any, index: number) => {
                    const { dataKey, value, color } = entry;
                    const categoryNames = {
                        habits: 'Hábitos',
                        dailies: 'Diárias',
                        todos: 'Tarefas',
                        goals: 'Metas',
                        total: 'Total'
                    };

                    const categoryName = categoryNames[dataKey as keyof typeof categoryNames] || dataKey;

                    if (value > 0) {
                        return (
                            <div key={index} className="flex justify-between items-center gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="rounded-full w-3 h-3"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-muted-foreground">{categoryName}:</span>
                                </div>
                                <span className="font-medium text-foreground">{value}</span>
                            </div>
                        );
                    }
                    return null;
                })}

                {data.total > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                        <div className="flex justify-between items-center gap-2 font-bold text-sm">
                            <span className="text-foreground">Total do dia:</span>
                            <span className="text-primary">{data.total}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
}

export function WeeklyEvolutionChart() {
    const { data: todos = [], isLoading: todosLoading, dataUpdatedAt: todosUpdatedAt } = useTodos();
    const { data: habits = [], isLoading: habitsLoading, dataUpdatedAt: habitsUpdatedAt } = useHabits();
    const { data: dailies = [], isLoading: dailiesLoading, dataUpdatedAt: dailiesUpdatedAt } = useDailies();

    // Usar hook useGoals para buscar metas completadas
    const { data: goals = [], isLoading: goalsLoading, error: goalsError } = useGoals("COMPLETED");

    // Debug: verificar dados das metas
    if (process.env.NODE_ENV === 'development') {
        console.log('[WEEKLY-CHART] 🔍 === DEBUG METAS RECEBIDAS ===');
        console.log('[WEEKLY-CHART] Total de metas recebidas:', goals.length);
        console.log('[WEEKLY-CHART] Estrutura dos dados:', goals);
        console.log('[WEEKLY-CHART] Tipo de goals:', typeof goals);
        console.log('[WEEKLY-CHART] Goals é array?', Array.isArray(goals));
        console.log('[WEEKLY-CHART] Error:', goalsError);
        console.log('[WEEKLY-CHART] Is Loading:', goalsLoading);

        if (goals.length > 0) {
            console.log('[WEEKLY-CHART] ✅ Metas recebidas com sucesso:', goals.length, 'metas');
            console.log('[WEEKLY-CHART] Exemplo de meta:', goals[0]);
        } else {
            console.log('[WEEKLY-CHART] ❌ Nenhuma meta recebida');
        }
    }

    const { data: habitPeriods = [], isLoading: habitPeriodsLoading, error: habitPeriodsError } = useHabitPeriods();
    const { data: dailyLogs = [], isLoading: dailyLogsLoading, error: dailyLogsError } = useDailyLogs();
    const { data: todoLogs = [], isLoading: todoLogsLoading, error: todoLogsError } = useTodoLogs();

    const isLoading = todosLoading || habitsLoading || dailiesLoading || goalsLoading || habitPeriodsLoading || dailyLogsLoading || todoLogsLoading;
    const logsError = habitPeriodsError || dailyLogsError || todoLogsError || goalsError;
    const queryClient = useQueryClient();

    // Mostrar erro se houver problema ao carregar logs
    if (logsError && !isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Evolução Semanal</CardTitle>
                    <CardDescription>
                        Atividades concluídas das 4 categorias ao longo da semana atual
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-[300px]">
                        <div className="text-center">
                            <div className="mx-auto mb-3 text-red-500">
                                <svg className="mx-auto w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="mb-3 text-red-600">Erro ao carregar dados da evolução semanal</p>
                            <p className="mb-4 text-muted-foreground text-sm">{logsError?.message || 'Erro desconhecido'}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.reload()}
                            >
                                Tentar Novamente
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calcular a última atualização dos dados
    const lastUpdated = Math.max(
        todosUpdatedAt || 0,
        habitsUpdatedAt || 0,
        dailiesUpdatedAt || 0,
        Date.now() // Para goals, usar timestamp atual já que não temos updatedAt
    );

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        queryClient.invalidateQueries({ queryKey: ["habits"] });
        queryClient.invalidateQueries({ queryKey: ["dailies"] });
        // Invalidar goals com a query key correta (incluindo filtros)
        queryClient.invalidateQueries({ queryKey: ["goals", "list"] });
        // Invalidar também os logs - usando query keys consistentes com os endpoints
        queryClient.invalidateQueries({ queryKey: ["habitPeriods"] });
        queryClient.invalidateQueries({ queryKey: ["dailyLogs"] });
        queryClient.invalidateQueries({ queryKey: ["todoLogs"] });
    };

    // Calcular dados da evolução semanal com query key específica
    const chartData = useMemo(() => {
        const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Início da semana (domingo)

        return daysOfWeek.map((dayName, index) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + index);

            // Criar datas no fuso horário local para evitar problemas de timezone
            const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0, 0);
            const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59, 999);

            // Filtrar logs de tarefas concluídas por dia (baseado na data de conclusão)
            const dayTodos = todoLogs.filter((log: TodoLog) => {
                if (!log.completedAt) return false;
                const completed = new Date(log.completedAt);
                const normalizedCompleted = new Date(completed.getFullYear(), completed.getMonth(), completed.getDate());
                const normalizedDayStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate());
                const normalizedDayEnd = new Date(dayEnd.getFullYear(), dayEnd.getMonth(), dayEnd.getDate());
                return normalizedCompleted >= normalizedDayStart && normalizedCompleted <= normalizedDayEnd;
            });

            // Filtrar entradas de hábitos por dia
            const dayHabits = habitPeriods.flatMap(period =>
                period.HabitEntry.filter(entry => {
                    const entryDate = new Date(entry.timestamp);
                    const normalizedEntry = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
                    const normalizedDayStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate());
                    const normalizedDayEnd = new Date(dayEnd.getFullYear(), dayEnd.getMonth(), dayEnd.getDate());
                    return normalizedEntry >= normalizedDayStart && normalizedEntry <= normalizedDayEnd;
                })
            );

            // Filtrar logs de diárias concluídas por dia
            const dayDailies = dailyLogs.filter((log: DailyLog) => {
                if (!log.completedAt) return false;
                const completed = new Date(log.completedAt);
                const normalizedCompleted = new Date(completed.getFullYear(), completed.getMonth(), completed.getDate());
                const normalizedDayStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate());
                const normalizedDayEnd = new Date(dayEnd.getFullYear(), dayEnd.getMonth(), dayEnd.getDate());
                return normalizedCompleted >= normalizedDayStart && normalizedCompleted <= normalizedDayEnd;
            });

            // Filtrar metas concluídas por dia
            const dayGoals = goals.filter((goal: Goal) => {
                if (goal.status !== 'COMPLETED' || !goal.updatedAt) {
                    return false;
                }

                const goalDate = new Date(goal.updatedAt);
                const normalizedGoalDate = new Date(goalDate.getFullYear(), goalDate.getMonth(), goalDate.getDate());
                const normalizedDayStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate());
                const normalizedDayEnd = new Date(dayEnd.getFullYear(), dayEnd.getMonth(), dayEnd.getDate());

                return normalizedGoalDate >= normalizedDayStart && normalizedGoalDate <= normalizedDayEnd;
            });

            return {
                day: dayName,
                date: dayDate.toISOString().split('T')[0],
                fullDate: dayDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }),
                habits: dayHabits.length,
                dailies: dayDailies.length,
                todos: dayTodos.length,
                goals: dayGoals.length,
                total: dayHabits.length + dayDailies.length + dayTodos.length + dayGoals.length,
            };
        });
    }, [todos, habits, dailies, goals, habitPeriods, dailyLogs, todoLogs]);


    // Garantir que sempre tenhamos dados válidos para o gráfico
    const hasData = chartData.some(day =>
        day.habits > 0 || day.dailies > 0 || day.todos > 0 || day.goals > 0
    );

    // Se não há dados, mostrar mensagem informativa
    if (!hasData && !isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle>Evolução Semanal</CardTitle>
                            <CardDescription>
                                Atividades concluídas ao longo da semana corrente
                                {lastUpdated && (
                                    <div className="mt-1 text-muted-foreground text-xs">
                                        Última atualização: {new Date(lastUpdated).toLocaleTimeString('pt-BR')}
                                    </div>
                                )}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-[300px]">
                        <div className="text-center">
                            <div className="mx-auto mb-3 text-muted-foreground">
                                <svg className="mx-auto w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="mb-3 text-muted-foreground">Nenhuma atividade concluída esta semana</p>
                            <p className="text-muted-foreground text-sm">As linhas aparecerão quando você concluir hábitos, diárias, tarefas ou metas.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }


    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Evolução Semanal</CardTitle>
                    <CardDescription>
                        Atividades concluídas ao longo da semana corrente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-[300px]">
                        <div className="text-center">
                            <div className="mx-auto mb-3 border-4 border-t-transparent border-blue-600 rounded-full w-8 h-8 animate-spin"></div>
                            <p className="text-blue-600">Carregando atividades da semana...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle>Evolução Semanal</CardTitle>
                        <CardDescription>
                            Atividades concluídas ao longo da semana corrente
                            {lastUpdated && (
                                <div className="mt-1 text-muted-foreground text-xs">
                                    Última atualização: {new Date(lastUpdated).toLocaleTimeString('pt-BR')}
                                </div>
                            )}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full h-[350px]">
                    <LineChart
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 20,
                            bottom: 12,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-habits)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-habits)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorDailies" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-dailies)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-dailies)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorTodos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-todos)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-todos)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-goals)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-goals)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid vertical={true} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={true}
                            tickMargin={8}
                            tickFormatter={(value) => value}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={true}
                            tickMargin={8}
                            tickFormatter={(value) => `${value}`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<CustomTooltip />}
                        />
                        <Line
                            type="monotone"
                            dataKey="habits"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="dailies"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="todos"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="goals"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                        />
                        <ChartLegend
                            content={() => (
                                <div className="flex flex-wrap justify-center gap-6 mt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-green-500 rounded-full rounded-bl-sm w-4 h-4" />
                                        <span className="font-medium text-muted-foreground text-sm">Hábitos</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-amber-500 rounded-full rounded-bl-sm w-4 h-4" />
                                        <span className="font-medium text-muted-foreground text-sm">Diárias</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-500 rounded-full rounded-bl-sm w-4 h-4" />
                                        <span className="font-medium text-muted-foreground text-sm">Tarefas</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-violet-500 rounded-full rounded-bl-sm w-4 h-4" />
                                        <span className="font-medium text-muted-foreground text-sm">Metas</span>
                                    </div>
                                </div>
                            )}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}