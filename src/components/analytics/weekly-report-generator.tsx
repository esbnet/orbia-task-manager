"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Award,
  Calendar,
  Clock,
  Download,
  Loader2,
  Mail,
  Target,
  TrendingUp
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdvancedAnalytics } from "@/hooks/use-advanced-analytics";
import { useDailies } from "@/hooks/use-dailies";
import { useGoals } from "@/hooks/use-goals";
import { useHabits } from "@/hooks/use-habits";
import { useTodos } from "@/hooks/use-todos";

export function WeeklyReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Hooks para dados em tempo real
  const { data: todos, isLoading: todosLoading, error: todosError } = useTodos();
  const { data: habits, isLoading: habitsLoading, error: habitsError } = useHabits();
  const { data: dailies, isLoading: dailiesLoading, error: dailiesError } = useDailies();
  const { data: goals, isLoading: goalsLoading, error: goalsError } = useGoals();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAdvancedAnalytics("week");

  // Calcular métricas em tempo real baseadas nos dados locais
  const realTimeMetrics = useMemo(() => {
    if (!todos || !habits || !dailies || !goals) return null;

    const now = new Date();
    const weekStart = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Filtrar dados da semana atual
    const weekTodos = todos.filter((todo: any) => new Date(todo.createdAt) >= weekStart);
    const weekHabits = habits.filter((habit: any) => habit.createdAt && new Date(habit.createdAt) >= weekStart);
    const weekDailies = dailies.filter((daily: any) => new Date(daily.createdAt) >= weekStart);
    const weekGoals = goals.filter((goal: any) => new Date(goal.createdAt) >= weekStart);

    // Calcular métricas
    const totalTasks = weekTodos.length + weekHabits.length + weekDailies.length;
    const completedTasks = weekTodos.filter((t: any) => t.completed).length +
      weekHabits.filter((h: any) => h.completedToday).length +
      weekDailies.filter((d: any) => d.completed).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calcular tempo estimado (em minutos)
    const estimatedTime = (weekTodos.length * 30) + (weekHabits.length * 15) + (weekDailies.length * 10);
    const averageDaily = Math.round(estimatedTime / 7);

    // Encontrar melhor e pior dia (baseado em volume de tarefas)
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayStats = daysOfWeek.map((day, index) => {
      const dayStart = new Date(weekStart);
      dayStart.setDate(weekStart.getDate() + index);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTodos = weekTodos.filter((t: any) => {
        const created = new Date(t.createdAt);
        return created >= dayStart && created <= dayEnd;
      });

      return { day, tasks: dayTodos.length };
    });

    const bestDay = dayStats.reduce((best, current) => current.tasks > best.tasks ? current : best, dayStats[0]);
    const worstDay = dayStats.reduce((worst, current) => current.tasks < worst.tasks ? current : worst, dayStats[0]);

    // Top categorias
    const categoryStats = {
      'Tarefas': weekTodos.length,
      'Hábitos': weekHabits.length,
      'Diárias': weekDailies.length,
      'Metas': weekGoals.length
    };
    const topCategories = Object.entries(categoryStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return {
      totalTasks,
      completedTasks,
      completionRate,
      estimatedTime,
      averageDaily,
      bestDay: bestDay.day,
      worstDay: worstDay.day,
      topCategories
    };
  }, [todos, habits, dailies, goals]);

  const generateReport = async () => {
    setIsGenerating(true);
    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);

    // Aqui você implementaria a geração real do PDF
    console.log("Relatório gerado!");
  };

  const sendByEmail = async () => {
    // Implementar envio por email
    console.log("Enviando por email...");
  };

  // Loading state
  const isLoading = todosLoading || habitsLoading || dailiesLoading || goalsLoading || analyticsLoading;
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Carregando dados do relatório...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  const hasError = todosError || habitsError || dailiesError || goalsError || analyticsError;
  if (hasError) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Erro ao carregar dados do relatório</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Usar dados em tempo real se disponíveis, senão fallback para API
  const currentWeek = realTimeMetrics || (analytics?.weeklyReports[0] ? {
    totalTasks: analytics.weeklyReports[0].totalTasks,
    completedTasks: analytics.weeklyReports[0].completedTasks,
    totalTime: analytics.weeklyReports[0].totalTime,
    estimatedTime: analytics.weeklyReports[0].totalTime, // Para compatibilidade
    averageDaily: analytics.weeklyReports[0].averageDaily,
    bestDay: analytics.weeklyReports[0].bestDay,
    worstDay: analytics.weeklyReports[0].worstDay,
    topCategories: analytics.weeklyReports[0].topCategories
  } : null) as any;

  if (!currentWeek) return null;

  const completionRate = realTimeMetrics?.completionRate || Math.round((currentWeek.completedTasks / currentWeek.totalTasks) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Relatório Semanal Automático
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={sendByEmail}
              disabled={isGenerating}
            >
              <Mail className="mr-2 w-4 h-4" />
              Enviar Email
            </Button>
            <Button
              size="sm"
              onClick={generateReport}
              disabled={isGenerating}
            >
              <Download className="mr-2 w-4 h-4" />
              {isGenerating ? "Gerando..." : "Gerar PDF"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <Target className="mx-auto mb-2 w-6 h-6 text-blue-600" />
              <p className="font-bold text-blue-600 text-2xl">{completionRate}%</p>
              <p className="text-blue-700 text-sm">Taxa de Conclusão</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <TrendingUp className="mx-auto mb-2 w-6 h-6 text-green-600" />
              <p className="font-bold text-green-600 text-2xl">{currentWeek.completedTasks}</p>
              <p className="text-green-700 text-sm">Tarefas Concluídas</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <Clock className="mx-auto mb-2 w-6 h-6 text-purple-600" />
              <p className="font-bold text-purple-600 text-2xl">{currentWeek.estimatedTime || currentWeek.totalTime}min</p>
              <p className="text-purple-700 text-sm">Tempo Total</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
              <Award className="mx-auto mb-2 w-6 h-6 text-orange-600" />
              <p className="font-bold text-orange-600 text-2xl">{currentWeek.averageDaily}</p>
              <p className="text-orange-700 text-sm">Média Diária</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Destaques Positivos
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {currentWeek.bestDay}
                  </Badge>
                  <span className="text-sm">foi seu melhor dia</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {currentWeek.topCategories[0]}
                  </Badge>
                  <span className="text-sm">categoria mais produtiva</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Áreas de Melhoria
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {currentWeek.worstDay}
                  </Badge>
                  <span className="text-sm">precisa de mais atenção</span>
                </div>
                {completionRate < 80 && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Meta
                    </Badge>
                    <span className="text-sm">aumentar taxa de conclusão</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="mb-3 font-medium">Recomendações para Próxima Semana</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Foque em manter a consistência nos dias de maior produtividade</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Continue priorizando a categoria "{currentWeek.topCategories[0]}"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>Planeje atividades mais leves para {currentWeek.worstDay}</span>
              </li>
            </ul>
          </div>

          {/* Auto-generation Settings */}
          <div className="p-4 border border-dashed rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Relatórios Automáticos</h4>
                <p className="text-muted-foreground text-sm">
                  Receba relatórios semanais por email toda segunda-feira
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}