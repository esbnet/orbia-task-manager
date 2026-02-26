"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Clock,
  Pause,
  Play,
  Square,
  Target,
  Timer
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnalyticsTags } from "@/hooks/use-analytics-tags";
import { useGoals } from "@/hooks/use-goals";
import { useHabits } from "@/hooks/use-habits";
import { useTodos } from "@/hooks/use-todos";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface TimeEntry {
  category: string;
  task: string;
  duration: number;
  date: Date;
}

interface CategoryTime {
  category: string;
  totalTime: number;
  percentage: number;
  color: string;
  tasks: number;
}

export function TimeTrackingDashboard() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [currentCategory, setCurrentCategory] = useState("Trabalho");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Buscar dados reais
  const { data: todos } = useTodos();
  const { data: habits } = useHabits();
  const { data: goals } = useGoals();
  const { data: userTags } = useAnalyticsTags();

  // Dados reais de registros de tempo (temporariamente mock até resolver problema dos hooks)
  const realTimeEntries: any[] = [];

  // Calcular entradas de tempo baseadas em dados reais ou estimativas
  const timeEntries = useMemo((): TimeEntry[] => {
    // Se há registros reais de tempo, usar eles
    if (realTimeEntries && realTimeEntries.length > 0) {
      return realTimeEntries.map(entry => ({
        category: entry.category,
        task: `${entry.taskType.toUpperCase()}: ${entry.taskId}`, // Temporário até mapear IDs para títulos
        duration: entry.duration,
        date: new Date(entry.date)
      }));
    }

    // Caso contrário, usar estimativas baseadas em tarefas concluídas
    const entries: TimeEntry[] = [];

    // Adicionar entradas baseadas em todos concluídos
    if (todos) {
      todos.forEach((todo: any) => {
        if (todo.lastCompletedDate) {
          const category = todo.tags?.[0] || "Geral";
          const duration = todo.difficulty === "Difícil" ? 45 :
            todo.difficulty === "Médio" ? 25 : 15;

          entries.push({
            category,
            task: todo.title,
            duration,
            date: new Date(todo.lastCompletedDate)
          });
        }
      });
    }

    // Adicionar entradas baseadas em hábitos (estimativa)
    if (habits) {
      habits.forEach((habit: any) => {
        // Estimar tempo baseado na frequência
        const duration = habit.frequency === "Diária" ? 10 :
          habit.frequency === "Semanal" ? 30 : 60;

        entries.push({
          category: habit.tags?.[0] || "Hábitos",
          task: habit.title,
          duration,
          date: new Date() // Hábitos não têm data específica, usar hoje
        });
      });
    }

    // Adicionar entradas baseadas em goals (estimativa)
    if (goals) {
      goals.forEach((goal: any) => {
        // Estimar tempo baseado na prioridade
        const duration = goal.priority === "URGENT" ? 120 :
          goal.priority === "HIGH" ? 90 :
            goal.priority === "MEDIUM" ? 60 : 30;

        entries.push({
          category: goal.category || "Metas",
          task: goal.title,
          duration,
          date: new Date() // Goals não têm data específica, usar hoje
        });
      });
    }

    // Se não houver dados, criar entradas de exemplo
    if (entries.length === 0) {
      return [
        { category: "Trabalho", task: "Desenvolvimento", duration: 180, date: new Date() },
        { category: "Pessoal", task: "Exercícios", duration: 60, date: new Date() },
        { category: "Estudos", task: "Leitura", duration: 90, date: new Date() },
        { category: "Casa", task: "Limpeza", duration: 45, date: new Date() },
        { category: "Saúde", task: "Consulta", duration: 30, date: new Date() },
      ];
    }

    return entries.slice(0, 20); // Limitar a 20 entradas mais recentes
  }, [realTimeEntries, todos, habits, goals]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  // Calcular estatísticas de categoria
  const categoryStats: CategoryTime[] = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    timeEntries.forEach(entry => {
      categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.duration;
    });

    const totalTime = Object.values(categoryTotals).reduce((sum: number, time: number) => sum + time, 0);

    return Object.entries(categoryTotals).map(([category, time], index) => ({
      category,
      totalTime: time,
      percentage: Math.round((time / totalTime) * 100),
      color: COLORS[index % COLORS.length],
      tasks: timeEntries.filter((e: TimeEntry) => e.category === category).length
    }));
  }, [timeEntries]);

  // Opções de categoria baseadas nas tags do usuário
  const categoryOptions = useMemo(() => {
    if (userTags && userTags.length > 0) {
      return userTags.map(tag => tag.name);
    }
    return ["Trabalho", "Pessoal", "Estudos", "Casa", "Saúde"];
  }, [userTags]);

  // Opções de tarefa baseadas nas 4 categorias ativas
  const taskOptions = useMemo(() => {
    const options: Array<{ id: string; title: string; type: string; category?: string }> = [];

    // Adicionar todos
    if (todos) {
      todos.forEach((todo: any) => {
        options.push({
          id: `todo-${todo.id}`,
          title: todo.title,
          type: "todo",
          category: todo.tags?.[0] || "Geral"
        });
      });
    }

    // Adicionar hábitos
    if (habits) {
      habits.forEach((habit: any) => {
        options.push({
          id: `habit-${habit.id}`,
          title: habit.title,
          type: "habit",
          category: habit.tags?.[0] || "Hábitos"
        });
      });
    }

    // Adicionar goals
    if (goals) {
      goals.forEach((goal: any) => {
        options.push({
          id: `goal-${goal.id}`,
          title: goal.title,
          type: "goal",
          category: goal.category || "Metas"
        });
      });
    }

    return options;
  }, [todos, habits, goals]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const startTracking = () => {
    setIsTracking(true);
    setElapsedTime(0);
  };

  const pauseTracking = () => {
    setIsTracking(false);
  };

  const stopTracking = async () => {
    setIsTracking(false);

    if (currentTask && elapsedTime > 0) {
      try {
        // Extrair informações da tarefa selecionada
        const [taskType, taskId] = currentTask.split('-');

        const response = await fetch('/api/time-tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId,
            taskType,
            category: currentCategory,
            duration: elapsedTime,
            date: new Date().toISOString()
          }),
        });

        if (response.ok) {
        } else {
        }
      } catch (error) {
      }
    }

    setElapsedTime(0);
    setCurrentTask("");
  };

  return (
    <div className="space-y-6">
      {/* Active Timer */}
      <Card className="bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Cronômetro Ativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-2 font-mono font-bold text-blue-600 text-4xl">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-muted-foreground text-sm">
                {currentTask || "Nenhuma tarefa selecionada"}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {!isTracking ? (
                <Button onClick={startTracking} className="bg-green-600 hover:bg-green-700">
                  <Play className="mr-2 w-4 h-4" />
                  Iniciar
                </Button>
              ) : (
                <Button onClick={pauseTracking} variant="outline">
                  <Pause className="mr-2 w-4 h-4" />
                  Pausar
                </Button>
              )}
              <Button onClick={stopTracking} variant="outline">
                <Square className="mr-2 w-4 h-4" />
                Parar
              </Button>
            </div>

            <div className="gap-4 grid grid-cols-2">
              <div>
                <label className="font-medium text-sm">Tarefa</label>
                <select
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  className="bg-background dark:bg-gray-800 mt-1 px-3 py-2 border border-input dark:border-gray-600 focus:border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring w-full text-foreground dark:text-gray-100 text-sm"
                >
                  <option value="">Selecione uma tarefa...</option>
                  {taskOptions.map(task => (
                    <option key={task.id} value={task.id}>
                      [{task.type.toUpperCase()}] {task.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-medium text-sm">Categoria</label>
                <select
                  value={currentCategory}
                  onChange={(e) => setCurrentCategory(e.target.value)}
                  className="bg-background dark:bg-gray-800 mt-1 px-3 py-2 border border-input dark:border-gray-600 focus:border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring w-full text-foreground dark:text-gray-100 text-sm"
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Analysis */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalTime"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${formatDuration(value as number)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Detalhes por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="rounded-full w-3 h-3"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatDuration(category.totalTime)}</div>
                      <div className="text-muted-foreground text-xs">{category.tasks} tarefas</div>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Registros Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeEntries.map((entry: TimeEntry, index: number) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{entry.category}</Badge>
                  <span className="font-medium">{entry.task}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatDuration(entry.duration)}</div>
                  <div className="text-muted-foreground text-xs">
                    {entry.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}