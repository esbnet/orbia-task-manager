"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Clock, 
  Timer, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  BarChart3,
  Target
} from "lucide-react";
import { useState, useMemo } from "react";

interface TaskEstimate {
  id: string;
  title: string;
  category: string;
  estimatedTime: number;
  actualTime?: number;
  complexity: number; // 1-5
  confidence: number; // 1-5
  factors: string[];
  completed: boolean;
}

export function TimeEstimator() {
  const [tasks, setTasks] = useState<TaskEstimate[]>([
    {
      id: "1",
      title: "Revisar código do projeto",
      category: "Desenvolvimento",
      estimatedTime: 45,
      actualTime: 52,
      complexity: 4,
      confidence: 3,
      factors: ["Revisão", "Testes"],
      completed: true
    },
    {
      id: "2",
      title: "Fazer exercícios",
      category: "Saúde",
      estimatedTime: 30,
      actualTime: 28,
      complexity: 2,
      confidence: 5,
      factors: ["Rotina"],
      completed: true
    },
    {
      id: "3",
      title: "Estudar React Hooks",
      category: "Estudos",
      estimatedTime: 60,
      complexity: 3,
      confidence: 4,
      factors: ["Aprendizado", "Prática"],
      completed: false
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: "",
    category: "Trabalho",
    estimatedTime: 30,
    complexity: 3,
    confidence: 3,
    factors: [] as string[]
  });

  // Análise de precisão das estimativas
  const estimationAccuracy = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed && t.actualTime);
    
    if (completedTasks.length === 0) return null;
    
    const accuracyData = completedTasks.map(task => {
      const variance = Math.abs(task.actualTime! - task.estimatedTime);
      const accuracy = Math.max(0, 100 - (variance / task.estimatedTime) * 100);
      return {
        task: task.title,
        estimated: task.estimatedTime,
        actual: task.actualTime!,
        accuracy: Math.round(accuracy),
        variance
      };
    });
    
    const avgAccuracy = accuracyData.reduce((sum, item) => sum + item.accuracy, 0) / accuracyData.length;
    
    return {
      average: Math.round(avgAccuracy),
      tasks: accuracyData,
      trend: avgAccuracy > 80 ? "good" : avgAccuracy > 60 ? "fair" : "poor"
    };
  }, [tasks]);

  // Sugestões baseadas em histórico
  const getTimeEstimateSuggestion = (category: string, complexity: number) => {
    const similarTasks = tasks.filter(t => 
      t.category === category && 
      Math.abs(t.complexity - complexity) <= 1 &&
      t.completed && 
      t.actualTime
    );
    
    if (similarTasks.length === 0) return null;
    
    const avgTime = similarTasks.reduce((sum, task) => sum + task.actualTime!, 0) / similarTasks.length;
    return Math.round(avgTime);
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const suggestion = getTimeEstimateSuggestion(newTask.category, newTask.complexity);
    
    const task: TaskEstimate = {
      id: Date.now().toString(),
      title: newTask.title,
      category: newTask.category,
      estimatedTime: suggestion || newTask.estimatedTime,
      complexity: newTask.complexity,
      confidence: newTask.confidence,
      factors: newTask.factors,
      completed: false
    };
    
    setTasks(prev => [...prev, task]);
    setNewTask({
      title: "",
      category: "Trabalho",
      estimatedTime: 30,
      complexity: 3,
      confidence: 3,
      factors: []
    });
  };

  const updateTaskTime = (taskId: string, actualTime: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, actualTime, completed: true }
        : task
    ));
  };

  const getComplexityLabel = (complexity: number) => {
    switch (complexity) {
      case 1: return "Muito Simples";
      case 2: return "Simples";
      case 3: return "Moderada";
      case 4: return "Complexa";
      case 5: return "Muito Complexa";
      default: return "Moderada";
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    switch (confidence) {
      case 1: return "Muito Baixa";
      case 2: return "Baixa";
      case 3: return "Média";
      case 4: return "Alta";
      case 5: return "Muito Alta";
      default: return "Média";
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl">Estimador de Tempo</h2>
        <p className="text-muted-foreground">
          Melhore suas estimativas com análise baseada em histórico
        </p>
      </div>

      {/* Accuracy Overview */}
      {estimationAccuracy && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold text-blue-600">
                {estimationAccuracy.average}%
              </p>
              <p className="text-sm text-muted-foreground">Precisão Média</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-green-600">
                {estimationAccuracy.tasks.length}
              </p>
              <p className="text-sm text-muted-foreground">Tarefas Analisadas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold text-purple-600">
                {estimationAccuracy.trend === "good" ? "Boa" : 
                 estimationAccuracy.trend === "fair" ? "Regular" : "Ruim"}
              </p>
              <p className="text-sm text-muted-foreground">Tendência</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Task Estimator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Nova Estimativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Título da Tarefa</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Digite o título da tarefa..."
                />
              </div>
              
              <div>
                <Label>Categoria</Label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Trabalho">Trabalho</option>
                  <option value="Desenvolvimento">Desenvolvimento</option>
                  <option value="Estudos">Estudos</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Pessoal">Pessoal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Tempo Estimado: {formatTime(newTask.estimatedTime)}</Label>
                <Slider
                  value={[newTask.estimatedTime]}
                  onValueChange={([value]) => setNewTask(prev => ({ ...prev, estimatedTime: value }))}
                  max={240}
                  min={5}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Complexidade: {getComplexityLabel(newTask.complexity)}</Label>
                <Slider
                  value={[newTask.complexity]}
                  onValueChange={([value]) => setNewTask(prev => ({ ...prev, complexity: value }))}
                  max={5}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Confiança: {getConfidenceLabel(newTask.confidence)}</Label>
                <Slider
                  value={[newTask.confidence]}
                  onValueChange={([value]) => setNewTask(prev => ({ ...prev, confidence: value }))}
                  max={5}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            {/* AI Suggestion */}
            {(() => {
              const suggestion = getTimeEstimateSuggestion(newTask.category, newTask.complexity);
              return suggestion && suggestion !== newTask.estimatedTime ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Sugestão baseada no histórico:</span>
                    <Badge variant="secondary">{formatTime(suggestion)}</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setNewTask(prev => ({ ...prev, estimatedTime: suggestion }))}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              ) : null;
            })()}

            <Button onClick={addTask} className="w-full">
              <Timer className="w-4 h-4 mr-2" />
              Adicionar Tarefa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Tarefas e Estimativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{task.title}</h4>
                      {task.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Categoria: {task.category}</span>
                      <span>Complexidade: {getComplexityLabel(task.complexity)}</span>
                      <span>Confiança: {getConfidenceLabel(task.confidence)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Estimado: {formatTime(task.estimatedTime)}
                      </Badge>
                      {task.actualTime && (
                        <Badge variant={
                          Math.abs(task.actualTime - task.estimatedTime) <= 5 ? "default" :
                          task.actualTime > task.estimatedTime ? "destructive" : "secondary"
                        }>
                          Real: {formatTime(task.actualTime)}
                        </Badge>
                      )}
                    </div>
                    
                    {!task.completed && (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          placeholder="Tempo real"
                          className="w-20 h-8 text-xs"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = parseInt((e.target as HTMLInputElement).value);
                              if (value > 0) {
                                updateTaskTime(task.id, value);
                              }
                            }
                          }}
                        />
                        <span className="text-xs text-muted-foreground">min</span>
                      </div>
                    )}
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