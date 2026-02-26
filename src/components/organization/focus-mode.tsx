"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Focus, 
  Play, 
  Pause, 
  Square, 
  Timer, 
  CheckCircle,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

interface FocusSession {
  taskId: string;
  taskTitle: string;
  estimatedTime: number;
  elapsedTime: number;
  isActive: boolean;
  isPaused: boolean;
}

export function FocusMode() {
  const [focusEnabled, setFocusEnabled] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);

  const [tasks] = useState([
    {
      id: "1",
      title: "Revisar código do projeto",
      estimatedTime: 45,
      priority: "high",
      completed: false
    },
    {
      id: "2", 
      title: "Fazer exercícios",
      estimatedTime: 30,
      priority: "medium",
      completed: false
    },
    {
      id: "3",
      title: "Estudar React",
      estimatedTime: 60,
      priority: "medium", 
      completed: true
    }
  ]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentSession?.isActive && !currentSession.isPaused) {
      interval = setInterval(() => {
        setCurrentSession(prev => {
          if (!prev) return null;
          
          const newElapsed = prev.elapsedTime + 1;
          
          // Notificar quando completar
          if (newElapsed >= prev.estimatedTime * 60) {
            if (soundEnabled) {
              // Aqui você adicionaria um som de notificação
            }
            return {
              ...prev,
              elapsedTime: newElapsed,
              isActive: false
            };
          }
          
          return {
            ...prev,
            elapsedTime: newElapsed
          };
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [currentSession?.isActive, currentSession?.isPaused, soundEnabled]);

  const startFocusSession = (task: any) => {
    setCurrentSession({
      taskId: task.id,
      taskTitle: task.title,
      estimatedTime: task.estimatedTime,
      elapsedTime: 0,
      isActive: true,
      isPaused: false
    });
  };

  const pauseSession = () => {
    setCurrentSession(prev => prev ? { ...prev, isPaused: true } : null);
  };

  const resumeSession = () => {
    setCurrentSession(prev => prev ? { ...prev, isPaused: false } : null);
  };

  const stopSession = () => {
    setCurrentSession(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!currentSession) return 0;
    return Math.min((currentSession.elapsedTime / (currentSession.estimatedTime * 60)) * 100, 100);
  };

  const visibleTasks = hideCompleted ? tasks.filter(t => !t.completed) : tasks;

  return (
    <div className="space-y-6">
      {/* Focus Controls */}
      <Card className={focusEnabled ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200" : ""}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Focus className="w-5 h-5" />
              Modo Foco
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Ocultar concluídas</span>
                <Switch checked={hideCompleted} onCheckedChange={setHideCompleted} />
              </div>
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-sm">Som</span>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Ativar Foco</span>
                <Switch checked={focusEnabled} onCheckedChange={setFocusEnabled} />
              </div>
            </div>
          </div>
        </CardHeader>
        
        {focusEnabled && (
          <CardContent>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-blue-300">
              <div className="text-center">
                <Focus className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-medium text-lg mb-2">Modo Foco Ativado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Distrações minimizadas. Foque na tarefa atual.
                </p>
                
                {currentSession ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{currentSession.taskTitle}</h4>
                      <div className="text-3xl font-mono font-bold text-blue-600 my-2">
                        {formatTime(currentSession.elapsedTime)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        de {currentSession.estimatedTime} minutos
                      </div>
                    </div>
                    
                    <Progress value={getProgress()} className="h-2" />
                    
                    <div className="flex gap-2 justify-center">
                      {currentSession.isPaused ? (
                        <Button onClick={resumeSession} size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Continuar
                        </Button>
                      ) : (
                        <Button onClick={pauseSession} variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </Button>
                      )}
                      <Button onClick={stopSession} variant="outline" size="sm">
                        <Square className="w-4 h-4 mr-2" />
                        Parar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Selecione uma tarefa abaixo para iniciar
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Tarefas Disponíveis
            {focusEnabled && <Badge variant="secondary">Modo Simplificado</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visibleTasks.map((task) => (
              <div
                key={task.id}
                className={`
                  p-4 border rounded-lg transition-all
                  ${focusEnabled ? 'bg-gray-50 dark:bg-gray-800' : 'hover:shadow-md'}
                  ${task.completed ? 'opacity-50' : ''}
                  ${currentSession?.taskId === task.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {task.completed && <CheckCircle className="w-5 h-5 text-green-500" />}
                    <div>
                      <h4 className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </h4>
                      {!focusEnabled && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {task.estimatedTime} min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {focusEnabled && (
                      <span className="text-sm text-muted-foreground">
                        {task.estimatedTime}min
                      </span>
                    )}
                    
                    {!task.completed && (
                      <Button
                        size="sm"
                        onClick={() => startFocusSession(task)}
                        disabled={currentSession?.isActive}
                        variant={currentSession?.taskId === task.id ? "default" : "outline"}
                      >
                        {currentSession?.taskId === task.id ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Ativa
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {visibleTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Todas as tarefas foram concluídas!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Focus Stats */}
      {focusEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Timer className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">
                {currentSession ? formatTime(currentSession.elapsedTime) : "0:00"}
              </p>
              <p className="text-sm text-muted-foreground">Tempo Atual</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Focus className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">
                {visibleTasks.filter(t => !t.completed).length}
              </p>
              <p className="text-sm text-muted-foreground">Tarefas Restantes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">
                {Math.round(getProgress())}%
              </p>
              <p className="text-sm text-muted-foreground">Progresso</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}