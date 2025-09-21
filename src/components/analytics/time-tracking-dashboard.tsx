"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  BarChart3,
  Timer,
  Target
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { useState, useEffect } from "react";

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
  const [timeEntries] = useState<TimeEntry[]>([
    { category: "Trabalho", task: "Desenvolvimento", duration: 180, date: new Date() },
    { category: "Pessoal", task: "Exercícios", duration: 60, date: new Date() },
    { category: "Estudos", task: "Leitura", duration: 90, date: new Date() },
    { category: "Casa", task: "Limpeza", duration: 45, date: new Date() },
    { category: "Saúde", task: "Consulta", duration: 30, date: new Date() },
  ]);

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

  // Calculate category statistics
  const categoryStats: CategoryTime[] = (() => {
    const categoryTotals = timeEntries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.duration;
      return acc;
    }, {} as Record<string, number>);

    const totalTime = Object.values(categoryTotals).reduce((sum, time) => sum + time, 0);
    
    return Object.entries(categoryTotals).map(([category, time], index) => ({
      category,
      totalTime: time,
      percentage: Math.round((time / totalTime) * 100),
      color: COLORS[index % COLORS.length],
      tasks: timeEntries.filter(e => e.category === category).length
    }));
  })();

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

  const stopTracking = () => {
    setIsTracking(false);
    // Aqui você salvaria o tempo registrado
    console.log(`Registrado: ${currentTask} (${currentCategory}) - ${formatTime(elapsedTime)}`);
    setElapsedTime(0);
    setCurrentTask("");
  };

  return (
    <div className="space-y-6">
      {/* Active Timer */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Cronômetro Ativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-sm text-muted-foreground">
                {currentTask || "Nenhuma tarefa selecionada"}
              </p>
            </div>
            
            <div className="flex gap-2 justify-center">
              {!isTracking ? (
                <Button onClick={startTracking} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar
                </Button>
              ) : (
                <Button onClick={pauseTracking} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </Button>
              )}
              <Button onClick={stopTracking} variant="outline">
                <Square className="w-4 h-4 mr-2" />
                Parar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tarefa</label>
                <input
                  type="text"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  placeholder="Digite a tarefa..."
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select
                  value={currentCategory}
                  onChange={(e) => setCurrentCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="Trabalho">Trabalho</option>
                  <option value="Pessoal">Pessoal</option>
                  <option value="Estudos">Estudos</option>
                  <option value="Casa">Casa</option>
                  <option value="Saúde">Saúde</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatDuration(category.totalTime)}</div>
                      <div className="text-xs text-muted-foreground">{category.tasks} tarefas</div>
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
            {timeEntries.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{entry.category}</Badge>
                  <span className="font-medium">{entry.task}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatDuration(entry.duration)}</div>
                  <div className="text-xs text-muted-foreground">
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