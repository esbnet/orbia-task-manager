"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    ExternalLink,
    Lightbulb,
    Target,
    TrendingDown,
    TrendingUp,
    Zap
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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

import { useGoals } from "@/contexts/goal-context";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { useHabits } from "@/hooks/use-habits";
import { useHabitsAnalytics } from "@/hooks/use-habits-analytics";
import { useTodos } from "@/hooks/use-todos";
import { Button } from "../ui/button";

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
        strongPoints: string[];
        attentionAreas: string[];
        suggestions: string[];
    };

    todosInsights: {
        completionPatterns: string[];
        priorityDistribution: { high: number; medium: number; low: number };
        timeManagement: string[];
        strongPoints: string[];
        attentionAreas: string[];
        suggestions: string[];
    };

    recurringTodosInsights: {
        completionRate: number;
        mostConsistent: string[];
        struggleAreas: string[];
        strongPoints: string[];
        attentionAreas: string[];
        suggestions: string[];
    };

    goalsInsights: {
        progressRate: number;
        riskAreas: string[];
        achievementPatterns: string[];
        strongPoints: string[];
        attentionAreas: string[];
        suggestions: string[];
    };

    // Recomendações práticas
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
}

// Componente Dialog de Recomendações
function RecommendationsDialog({
    isOpen,
    onClose,
    recommendations,
    habits,
    todos,
    recurringTodos,
    goals
}: {
    isOpen: boolean;
    onClose: () => void;
    recommendations: MetricsData['recommendations'];
    habits: any[];
    todos: any[];
    recurringTodos: any[];
    goals: any[];
}) {
    const getTaskLinks = (text: string) => {
        const links: Array<{ type: string; id: string; title: string; icon: string }> = [];

        // Procurar por hábitos mencionados
        habits?.forEach(habit => {
            if (text.toLowerCase().includes(habit.title.toLowerCase())) {
                links.push({
                    type: 'habit',
                    id: habit.id,
                    title: habit.title,
                    icon: '🏃'
                });
            }
        });

        // Procurar por todos mencionados
        todos?.forEach(todo => {
            if (text.toLowerCase().includes(todo.title.toLowerCase())) {
                links.push({
                    type: 'todo',
                    id: todo.id,
                    title: todo.title,
                    icon: '📝'
                });
            }
        });

        // Procurar por tarefas recorrentes mencionadas
        recurringTodos?.forEach((todo: any) => {
            if (text.toLowerCase().includes(todo.title.toLowerCase())) {
                links.push({
                    type: 'todo',
                    id: todo.id,
                    title: todo.title,
                    icon: '🔁'
                });
            }
        });

        // Procurar por goals mencionados
        goals?.forEach(goal => {
            if (text.toLowerCase().includes(goal.title.toLowerCase())) {
                links.push({
                    type: 'goal',
                    id: goal.id,
                    title: goal.title,
                    icon: '🎯'
                });
            }
        });

        return links;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Recomendações Personalizadas
                    </DialogTitle>
                    <DialogDescription>
                        Ações sugeridas baseadas na sua performance atual
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Ações Imediatas */}
                    {recommendations.immediate.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 mb-3 font-semibold text-orange-600">
                                <Zap className="w-4 h-4" />
                                Ações Imediatas
                            </h3>
                            <div className="space-y-2">
                                {recommendations.immediate.map((rec, index) => {
                                    const links = getTaskLinks(rec);
                                    return (
                                        <div key={index} className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg">
                                            <span className="mt-0.5 text-orange-500">⚡</span>
                                            <div className="flex-1">
                                                <p className="text-sm">{rec}</p>
                                                {links.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {links.map((link, linkIndex) => (
                                                            <Button
                                                                key={linkIndex}
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-6 text-xs"
                                                                onClick={() => {
                                                                    // Aqui você pode implementar navegação para a tarefa
                                                                }}
                                                            >
                                                                <ExternalLink className="mr-1 w-3 h-3" />
                                                                {link.icon} {link.title}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Curto Prazo */}
                    {recommendations.shortTerm.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 mb-3 font-semibold text-blue-600">
                                <Clock className="w-4 h-4" />
                                Curto Prazo
                            </h3>
                            <div className="space-y-2">
                                {recommendations.shortTerm.map((rec, index) => {
                                    const links = getTaskLinks(rec);
                                    return (
                                        <div key={index} className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
                                            <span className="mt-0.5 text-blue-500">📅</span>
                                            <div className="flex-1">
                                                <p className="text-sm">{rec}</p>
                                                {links.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {links.map((link, linkIndex) => (
                                                            <Button
                                                                key={linkIndex}
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-6 text-xs"
                                                                onClick={() => {
                                                                }}
                                                            >
                                                                <ExternalLink className="mr-1 w-3 h-3" />
                                                                {link.icon} {link.title}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Longo Prazo */}
                    {recommendations.longTerm.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 mb-3 font-semibold text-green-600">
                                <Target className="w-4 h-4" />
                                Longo Prazo
                            </h3>
                            <div className="space-y-2">
                                {recommendations.longTerm.map((rec, index) => {
                                    const links = getTaskLinks(rec);
                                    return (
                                        <div key={index} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg">
                                            <span className="mt-0.5 text-green-500">🎯</span>
                                            <div className="flex-1">
                                                <p className="text-sm">{rec}</p>
                                                {links.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {links.map((link, linkIndex) => (
                                                            <Button
                                                                key={linkIndex}
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-6 text-xs"
                                                                onClick={() => {
                                                                }}
                                                            >
                                                                <ExternalLink className="mr-1 w-3 h-3" />
                                                                {link.icon} {link.title}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function MetricsDashboard() {
    const { goals } = useGoals();
    const { data: todos } = useTodos();
    const { isAuthenticated } = useAuthenticatedApi();
    const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");
    const { data: habitsAnalytics } = useHabitsAnalytics(timeRange);
    const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
    const [isRecommendationsDialogOpen, setIsRecommendationsDialogOpen] = useState(false);
    const [attachedTasksStats, setAttachedTasksStats] = useState<{
        habits: number;
        todos: number;
    } | null>(null);

    // Hooks para obter estatísticas de tags
    const { data: habits } = useHabits();
    const recurringTodos = useMemo(
        () => (todos || []).filter((todo: any) => todo.recurrence !== "none" || todo.todoType === "recorrente"),
        [todos],
    );

    const habitTags = useMemo(() => {
        if (!habits) return [];

        const tagCounts: { [key: string]: number } = {};

        habits.forEach((habit: any) => {
            habit.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    }, [habits]);

    const todoTags = (() => {
        if (!todos) return [];
        const tagCounts: { [key: string]: number } = {};
        todos.forEach((todo: any) => {
            todo.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    })();

    const recurringTodoTags = (() => {
        if (!recurringTodos.length) return [];
        const tagCounts: { [key: string]: number } = {};
        recurringTodos.forEach((todo: any) => {
            todo.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    })();

    const goalTags = (() => {
        if (!goals) return [];
        const tagCounts: { [key: string]: number } = {};
        goals.forEach((goal: any) => {
            goal.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    })();

    const calculateMetrics = useCallback(() => {
        if (!habitsAnalytics || !todos) return;

        // Cálculos básicos aprimorados
        const totalHabits = habitsAnalytics.totalHabits;
        const activeHabits = habitsAnalytics.activeHabits;
        const habitsCompletionRate = habitsAnalytics.completionRate;

        const totalTodos = todos.length;
        const completedTodos = todos.filter(todo => todo.lastCompletedDate).length;
        const todosCompletionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

        // Calcular taxa de conclusão de todos nos últimos 7 dias
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const recentCompletedTodos = todos.filter(todo =>
            todo.lastCompletedDate && new Date(todo.lastCompletedDate) >= lastWeek
        ).length;
        const recentTodosCompletionRate = totalTodos > 0 ? (recentCompletedTodos / totalTodos) * 100 : 0;

        const totalRecurringTodos = recurringTodos.length;
        const completedRecurringTodos = recurringTodos.filter(todo => todo.lastCompletedDate).length;
        const recurringTodosCompletionRate = totalRecurringTodos > 0 ? (completedRecurringTodos / totalRecurringTodos) * 100 : 0;

        const totalGoals = goals.length;
        const completedGoals = goals.filter(goal => goal.status === "COMPLETED").length;
        const inProgressGoals = goals.filter(goal => goal.status === "IN_PROGRESS").length;
        const overdueGoals = goals.filter(goal =>
            goal.status === "IN_PROGRESS" && new Date(goal.targetDate) < new Date()
        ).length;
        const goalsCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

        // Calcular score de consistência baseado em múltiplos fatores
        const habitConsistency = habitsAnalytics.currentStreaks.length > 0 ?
            Math.min(habitsAnalytics.currentStreaks.reduce((sum, streak) => sum + streak.streakDays, 0) / habitsAnalytics.currentStreaks.length, 30) / 30 * 100 : 0;

        const recurringConsistency = recurringTodosCompletionRate;
        const goalConsistency = totalGoals > 0 ? ((completedGoals + (inProgressGoals - overdueGoals)) / totalGoals) * 100 : 0;

        const consistencyScore = Math.round(
            (habitConsistency * 0.4) +
            (recurringConsistency * 0.4) +
            (goalConsistency * 0.2)
        );

        // Score geral com pesos dinâmicos baseados na atividade
        const hasHabits = totalHabits > 0;
        const hasTodos = totalTodos > 0;
        const hasRecurringTodos = totalRecurringTodos > 0;
        const hasGoals = totalGoals > 0;

        let habitsWeight = 0.3;
        let todosWeight = 0.25;
        let recurringTodosWeight = 0.25;
        let goalsWeight = 0.2;

        // Ajustar pesos baseado na atividade
        if (!hasHabits) {
            habitsWeight = 0;
            const remainingWeight = todosWeight + recurringTodosWeight + goalsWeight;
            todosWeight = hasTodos ? todosWeight / remainingWeight : 0;
            recurringTodosWeight = hasRecurringTodos ? recurringTodosWeight / remainingWeight : 0;
            goalsWeight = hasGoals ? goalsWeight / remainingWeight : 0;
        }
        if (!hasTodos) {
            todosWeight = 0;
            const remainingWeight = habitsWeight + recurringTodosWeight + goalsWeight;
            habitsWeight = hasHabits ? habitsWeight / remainingWeight : 0;
            recurringTodosWeight = hasRecurringTodos ? recurringTodosWeight / remainingWeight : 0;
            goalsWeight = hasGoals ? goalsWeight / remainingWeight : 0;
        }
        if (!hasRecurringTodos) {
            recurringTodosWeight = 0;
            const remainingWeight = habitsWeight + todosWeight + goalsWeight;
            habitsWeight = hasHabits ? habitsWeight / remainingWeight : 0;
            todosWeight = hasTodos ? todosWeight / remainingWeight : 0;
            goalsWeight = hasGoals ? goalsWeight / remainingWeight : 0;
        }
        if (!hasGoals) {
            goalsWeight = 0;
            const remainingWeight = habitsWeight + todosWeight + recurringTodosWeight;
            habitsWeight = hasHabits ? habitsWeight / remainingWeight : 0;
            todosWeight = hasTodos ? todosWeight / remainingWeight : 0;
            recurringTodosWeight = hasRecurringTodos ? recurringTodosWeight / remainingWeight : 0;
        }

        const overallScore = Math.round(
            (habitsCompletionRate * habitsWeight) +
            (todosCompletionRate * todosWeight) +
            (recurringTodosCompletionRate * recurringTodosWeight) +
            (goalsCompletionRate * goalsWeight)
        );

        // Insights de hábitos aprimorados
        const habitsInsights = {
            bestPerforming: habitsAnalytics.currentStreaks
                .filter(streak => streak.streakDays > 7)
                .map(streak => streak.habitTitle),
            needsAttention: habitsAnalytics.currentStreaks
                .filter(streak => streak.streakDays === 0)
                .map(streak => streak.habitTitle),
            streakOpportunities: habitsAnalytics.currentStreaks
                .filter(streak => streak.streakDays > 0 && streak.streakDays < 7)
                .map(streak => streak.habitTitle),
            strongPoints: [
                habitsCompletionRate > 80 ? "Excelente taxa de conclusão de hábitos!" : "",
                habitsAnalytics.currentStreaks.some(s => s.streakDays > 30) ? "Hábitos com streaks impressionantes!" : "",
                activeHabits === totalHabits ? "Todos os hábitos estão ativos!" : "",
            ].filter(Boolean),
            attentionAreas: [
                habitsCompletionRate < 30 ? "Taxa de conclusão muito baixa - revise seus hábitos" : "",
                habitsAnalytics.currentStreaks.length === 0 ? "Nenhum streak ativo - comece pequeno" : "",
                activeHabits < totalHabits * 0.5 ? "Muitos hábitos pausados - considere reativar alguns" : "",
            ].filter(Boolean),
            suggestions: [
                habitsCompletionRate < 50 ? "Considere reduzir a frequência de hábitos difíceis" : "",
                habitsAnalytics.currentStreaks.length === 0 ? "Comece com hábitos simples para construir momentum" : "",
                activeHabits < totalHabits * 0.7 ? "Reative hábitos pausados recentemente" : "",
                "Configure lembretes para hábitos importantes",
                "Acompanhe seu progresso diário em hábitos",
            ].filter(Boolean),
        };

        // Insights de todos aprimorados
        const todosInsights = {
            completionPatterns: [
                todosCompletionRate > 80 ? "Excelente taxa de conclusão de tarefas!" : "",
                todosCompletionRate > 60 ? "Boa produtividade em tarefas!" : "",
                completedTodos > totalTodos * 0.5 ? "Bom equilíbrio entre criação e conclusão" : "",
                recentTodosCompletionRate > todosCompletionRate ? "Melhoria recente na conclusão de tarefas!" : "",
            ].filter(Boolean),
            priorityDistribution: { high: 0, medium: 0, low: 0 }, // TODO: implementar baseado em dados reais
            timeManagement: [
                todosCompletionRate < 60 ? "Considere quebrar tarefas grandes em menores" : "",
                totalTodos > 20 ? "Avalie se todas as tarefas são prioritárias" : "",
                recentTodosCompletionRate < 40 ? "Foco em conclusão de tarefas pendentes" : "",
            ].filter(Boolean),
            strongPoints: [
                todosCompletionRate > 70 ? "Alta produtividade em tarefas!" : "",
                recentTodosCompletionRate > 60 ? "Consistência recente nas tarefas!" : "",
                totalTodos > 0 && completedTodos === totalTodos ? "Todas as tarefas concluídas!" : "",
            ].filter(Boolean),
            attentionAreas: [
                todosCompletionRate < 40 ? "Taxa de conclusão baixa - revise suas tarefas" : "",
                totalTodos === 0 ? "Nenhuma tarefa criada - comece planejando atividades" : "",
                recentTodosCompletionRate < 30 ? "Pouca atividade recente em tarefas" : "",
            ].filter(Boolean),
            suggestions: [
                todosCompletionRate < 70 ? "Use a técnica Pomodoro para tarefas complexas" : "",
                "Priorize tarefas usando o método Eisenhower",
                "Defina prazos realistas para evitar procrastinação",
                "Quebre tarefas grandes em subtarefas menores",
                "Revise tarefas semanalmente",
            ],
        };

        // Insights de tarefas recorrentes
        const recurringTodosInsights = {
            completionRate: recurringTodosCompletionRate,
            mostConsistent: recurringTodos.slice(0, 3).map(todo => todo.title) || [],
            struggleAreas: recurringTodosCompletionRate < 70 ? ["Execução recorrente"] : [],
            strongPoints: [
                recurringTodosCompletionRate > 90 ? "Excelente consistência em tarefas recorrentes!" : "",
                recurringTodosCompletionRate > 80 ? "Muito consistente com tarefas recorrentes!" : "",
                completedRecurringTodos === totalRecurringTodos && totalRecurringTodos > 0 ? "Todas as tarefas recorrentes foram concluídas!" : "",
            ].filter(Boolean),
            attentionAreas: [
                recurringTodosCompletionRate < 50 ? "Baixa consistência em tarefas recorrentes - revise suas rotinas" : "",
                totalRecurringTodos === 0 ? "Nenhuma tarefa recorrente configurada - aproveite a recorrência de tarefas" : "",
                recurringTodosCompletionRate < 70 ? "Dificuldade em manter consistência nas tarefas recorrentes" : "",
            ].filter(Boolean),
            suggestions: [
                recurringTodosCompletionRate < 80 ? "Configure lembretes para tarefas recorrentes" : "",
                totalRecurringTodos > 10 ? "Considere reduzir tarefas recorrentes para focar no essencial" : "",
                "Combine tarefas recorrentes com hábitos existentes para reforço",
                "Estabeleça horários fixos para tarefas recorrentes",
                "Acompanhe seu progresso diário",
            ].filter(Boolean),
        };

        // Insights de goals aprimorados
        const goalsInsights = {
            progressRate: goalsCompletionRate,
            riskAreas: goals
                .filter(goal => goal.status === "IN_PROGRESS" && new Date(goal.targetDate) < new Date())
                .map(goal => goal.title),
            achievementPatterns: [
                completedGoals > totalGoals * 0.5 ? "Bom histórico de conclusão de metas" : "",
                completedGoals === totalGoals && totalGoals > 0 ? "Todas as metas concluídas!" : "",
                inProgressGoals > completedGoals ? "Foco em execução de metas em andamento" : "",
            ].filter(Boolean),
            strongPoints: [
                goalsCompletionRate > 70 ? "Excelente progresso em metas!" : "",
                completedGoals > 0 ? `${completedGoals} meta(s) concluída(s) com sucesso!` : "",
                overdueGoals === 0 && inProgressGoals > 0 ? "Nenhuma meta atrasada!" : "",
            ].filter(Boolean),
            attentionAreas: [
                goalsCompletionRate < 40 ? "Baixo progresso em metas - revise suas estratégias" : "",
                overdueGoals > 0 ? `${overdueGoals} meta(s) atrasada(s) - reavalie prazos` : "",
                totalGoals === 0 ? "Nenhuma meta definida - estabeleça objetivos claros" : "",
            ].filter(Boolean),
            suggestions: [
                goalsCompletionRate < 50 ? "Quebre metas grandes em milestones menores" : "",
                "Defina metas SMART (Específicas, Mensuráveis, Atingíveis, Relevantes, Temporais)",
                "Acompanhe o progresso semanalmente",
                "Celebre conquistas intermediárias",
                "Ajuste metas baseado no feedback real",
            ].filter(Boolean),
        };

        // Recomendações práticas
        const recommendations = {
            immediate: [
                overallScore < 60 ? "✨ Comece completando 3 atividades hoje para ganhar momentum" : "",
                recurringTodosCompletionRate < 70 ? "🔁 Configure lembretes para suas tarefas recorrentes" : "",
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
            recurringTodosInsights,
            goalsInsights,
            recommendations,
        });
    }, [habitsAnalytics, todos, recurringTodos, goals]);

    useEffect(() => {
        calculateMetrics();
    }, [calculateMetrics]);

    // Buscar estatísticas de tarefas anexadas
    useEffect(() => {
        const fetchAttachedTasksStats = async () => {
            if (!isAuthenticated || goals.length === 0) {
                setAttachedTasksStats({ habits: 0, todos: 0 });
                return;
            }

            let habitsCount = 0;
            let todosCount = 0;

            try {
                // Buscar tarefas anexadas para cada meta
                for (const goal of goals) {
                    const response = await fetch(`/api/goals/${goal.id}/tasks`);
                    if (response.ok) {
                        const tasks = await response.json();
                        tasks.forEach((task: any) => {
                            if (task.taskType === 'habit') habitsCount++;
                            else todosCount++;
                        });
                    }
                }

                setAttachedTasksStats({ habits: habitsCount, todos: todosCount });
            } catch (error) {
                // Fallback para estimativa
                setAttachedTasksStats({
                    habits: Math.floor(goals.length * 1.5),
                    todos: Math.floor(goals.length * 2.5)
                });
            }
        };

        fetchAttachedTasksStats();
    }, [isAuthenticated, goals]);

    // Calcular dados do gráfico de tarefas relacionadas
    const attachedTasksChartData = useMemo(() => {
        // Usar dados reais das tarefas anexadas se disponíveis, senão usar estimativa
        const habitsCount = attachedTasksStats?.habits || Math.floor(goals.length * 1.5);
        const todosCount = attachedTasksStats?.todos || Math.floor(goals.length * 2.5);

        return [
            {
                name: "Hábitos",
                value: habitsCount,
                color: "#10b981"
            },
            {
                name: "Tarefa",
                value: todosCount,
                color: "#f59e0b"
            }
        ];
    }, [goals, attachedTasksStats]);

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

                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsRecommendationsDialogOpen(true)}>
                    <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">Recomendações</CardTitle>
                        <Lightbulb className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-3xl">{metricsData.recommendations.immediate.length}</div>
                        <p className="text-muted-foreground text-xs">
                            Clique para ver todas as recomendações
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
                    <TabsTrigger value="recurring">Recorrentes</TabsTrigger>
                    <TabsTrigger value="goals">Metas</TabsTrigger>
                    <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-4">
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                    Pontos Fortes Alcançados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Hábitos */}
                                    {metricsData.habitsInsights.strongPoints.length > 0 && (
                                        <div>
                                            <p className="font-medium text-green-700 text-sm">🏃 Hábitos:</p>
                                            <ul className="space-y-1 mt-1 text-muted-foreground text-sm">
                                                {metricsData.habitsInsights.strongPoints.map((point, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-green-500" />
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Todos */}
                                    {metricsData.todosInsights.strongPoints.length > 0 && (
                                        <div>
                                            <p className="font-medium text-green-700 text-sm">📝 Tarefa:</p>
                                            <ul className="space-y-1 mt-1 text-muted-foreground text-sm">
                                                {metricsData.todosInsights.strongPoints.map((point, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-green-500" />
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Recorrentes */}
                                    {metricsData.recurringTodosInsights.strongPoints.length > 0 && (
                                        <div>
                                            <p className="font-medium text-green-700 text-sm">🔁 Recorrentes:</p>
                                            <ul className="space-y-1 mt-1 text-muted-foreground text-sm">
                                                {metricsData.recurringTodosInsights.strongPoints.map((point, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-green-500" />
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Goals */}
                                    {metricsData.goalsInsights.strongPoints.length > 0 && (
                                        <div>
                                            <p className="font-medium text-green-700 text-sm">🎯 Metas:</p>
                                            <ul className="space-y-1 mt-1 text-muted-foreground text-sm">
                                                {metricsData.goalsInsights.strongPoints.map((point, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-green-500" />
                                                        {point}
                                                    </li>
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
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                                    Áreas de Atenção
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Hábitos */}
                                    {metricsData.habitsInsights.attentionAreas.length > 0 && (
                                        <div>
                                            <p className="font-medium text-orange-700 text-sm">🏃 Hábitos:</p>
                                            <ul className="space-y-1 mt-1 text-muted-foreground text-sm">
                                                {metricsData.habitsInsights.attentionAreas.map((area, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <AlertTriangle className="flex-shrink-0 mt-0.5 w-4 h-4 text-orange-500" />
                                                        {area}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Todos */}
                                    {metricsData.todosInsights.attentionAreas.length > 0 && (
                                        <div>
                                            <p className="font-medium text-orange-700 text-sm">📝 Tarefa:</p>
                                            <ul className="space-y-1 mt-1 text-muted-foreground text-sm">
                                                {metricsData.todosInsights.attentionAreas.map((area, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <AlertTriangle className="flex-shrink-0 mt-0.5 w-4 h-4 text-orange-500" />
                                                        {area}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Recorrentes */}
                                    {metricsData.recurringTodosInsights.attentionAreas.length > 0 && (
                                        <div>
                                            <p className="font-medium text-orange-700 text-sm">🔁 Recorrentes:</p>
                                            <ul className="space-y-1 mt-1 text-muted-foreground text-sm">
                                                {metricsData.recurringTodosInsights.attentionAreas.map((area, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <AlertTriangle className="flex-shrink-0 mt-0.5 w-4 h-4 text-orange-500" />
                                                        {area}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Goals */}
                                    {metricsData.goalsInsights.attentionAreas.length > 0 && (
                                        <div>
                                            <p className="font-medium text-orange-700 text-sm">🎯 Metas:</p>
                                            <ul className="space-y-1 mt-1 text-muted-foreground text-sm">
                                                {metricsData.goalsInsights.attentionAreas.map((area, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <AlertTriangle className="flex-shrink-0 mt-0.5 w-4 h-4 text-orange-500" />
                                                        {area}
                                                    </li>
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
                                                color: item.difficulty === "Fácil" ? "#00C49F" : item.difficulty === "Média" ? "#FFBB28" : "#FF8042"
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
                                                <Cell key={`cell-${index}`} fill={item.difficulty === "Fácil" ? "#00C49F" : item.difficulty === "Média" ? "#FFBB28" : "#FF8042"} />
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
                                    <BarChart data={habitTags}>
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
                                        { name: "Média", value: todos?.filter(t => t.difficulty === "Média").length || 0 },
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
                                <BarChart data={todoTags}>
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

                <TabsContent value="recurring" className="space-y-4">
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance de Tarefas Recorrentes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Taxa de Conclusão</span>
                                        <span className="font-bold">{metricsData.recurringTodosInsights.completionRate.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Total</span>
                                        <span className="font-bold">{recurringTodos.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Concluídas</span>
                                        <span className="font-bold">{recurringTodos.filter(todo => todo.lastCompletedDate).length || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Otimização de Tarefas Recorrentes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {metricsData.recurringTodosInsights.suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Calendar className="flex-shrink-0 mt-0.5 w-4 h-4 text-blue-500" />
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gráficos de tarefas recorrentes */}
                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recorrentes por Dificuldade</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={recurringTodos.reduce((acc, todo) => {
                                                const existing = acc.find(item => item.name === todo.difficulty);
                                                if (existing) {
                                                    existing.value += 1;
                                                } else {
                                                    acc.push({ name: todo.difficulty, value: 1, color: todo.difficulty === "Fácil" ? "#00C49F" : todo.difficulty === "Média" ? "#FFBB28" : "#FF8042" });
                                                }
                                                return acc;
                                            }, [] as Array<{ name: string; value: number; color: string }>)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {recurringTodos.reduce((acc, todo) => {
                                                const existing = acc.find(item => item.name === todo.difficulty);
                                                if (existing) {
                                                    existing.value += 1;
                                                } else {
                                                    acc.push({ name: todo.difficulty, value: 1, color: todo.difficulty === "Fácil" ? "#00C49F" : todo.difficulty === "Média" ? "#FFBB28" : "#FF8042" });
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
                                <CardTitle>Recorrentes por Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Pendentes", value: recurringTodos.filter(todo => !todo.lastCompletedDate).length || 0, color: "#FFBB28" },
                                                { name: "Concluídas", value: recurringTodos.filter(todo => todo.lastCompletedDate).length || 0, color: "#00C49F" },
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
                                                { name: "Pendentes", value: recurringTodos.filter(todo => !todo.lastCompletedDate).length || 0, color: "#FFBB28" },
                                                { name: "Concluídas", value: recurringTodos.filter(todo => todo.lastCompletedDate).length || 0, color: "#00C49F" },
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
                            <CardTitle>Distribuição de Tags em Recorrentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={recurringTodoTags}>
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
                                    <BarChart data={goalTags}>
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

                    {/* Gráfico de Tarefas Relacionadas às Metas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tarefas Relacionadas às Metas</CardTitle>
                            <p className="text-muted-foreground text-sm">
                                Distribuição de tarefas anexadas por tipo
                            </p>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={attachedTasksChartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            `${value} tarefa${value !== 1 ? 's' : ''}`,
                                            'Total'
                                        ]}
                                    />
                                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                        {[
                                            { name: "Hábitos", color: "#10b981" },
                                            { name: "Tarefa", color: "#f59e0b" }
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
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

            {/* Dialog de Recomendações */}
            {metricsData && (
                <RecommendationsDialog
                    isOpen={isRecommendationsDialogOpen}
                    onClose={() => setIsRecommendationsDialogOpen(false)}
                    recommendations={metricsData.recommendations}
                    habits={habits || []}
                    todos={todos || []}
                    recurringTodos={recurringTodos}
                    goals={goals || []}
                />
            )}
        </div>
    );
}
