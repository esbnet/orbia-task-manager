"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Filter, 
  Search, 
  Clock, 
  Zap, 
  MapPin,
  GripVertical,
  Timer,
  Focus
} from "lucide-react";
import { useState, useMemo } from "react";
import { Switch } from "@/components/ui/switch";

interface Task {
  id: string;
  title: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  energy: "low" | "medium" | "high";
  estimatedTime: number;
  context: "home" | "office" | "anywhere" | "calls";
  tags: string[];
  completed: boolean;
  order: number;
}

export function TaskOrganizer() {
  const [focusMode, setFocusMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Revisar código do projeto",
      category: "Trabalho",
      priority: "high",
      energy: "high",
      estimatedTime: 45,
      context: "office",
      tags: ["desenvolvimento"],
      completed: false,
      order: 1
    },
    {
      id: "2", 
      title: "Fazer exercícios",
      category: "Saúde",
      priority: "medium",
      energy: "medium",
      estimatedTime: 30,
      context: "home",
      tags: ["exercício"],
      completed: false,
      order: 2
    }
  ]);

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    priority: "all",
    energy: "all",
    context: "all",
    timeRange: "all"
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category && filters.category !== "all" && task.category !== filters.category) return false;
      if (filters.priority && filters.priority !== "all" && task.priority !== filters.priority) return false;
      if (filters.energy && filters.energy !== "all" && task.energy !== filters.energy) return false;
      if (filters.context && filters.context !== "all" && task.context !== filters.context) return false;
      
      if (filters.timeRange && filters.timeRange !== "all") {
        const [min, max] = filters.timeRange.split("-").map(Number);
        if (task.estimatedTime < min || task.estimatedTime > max) return false;
      }
      
      return true;
    }).sort((a, b) => a.order - b.order);
  }, [tasks, filters]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData("text/plain");
    
    if (draggedTaskId === targetTaskId) return;
    
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const draggedIndex = newTasks.findIndex(t => t.id === draggedTaskId);
      const targetIndex = newTasks.findIndex(t => t.id === targetTaskId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prevTasks;
      
      const [draggedTask] = newTasks.splice(draggedIndex, 1);
      newTasks.splice(targetIndex, 0, draggedTask);
      
      return newTasks.map((task, index) => ({
        ...task,
        order: index + 1
      }));
    });
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-2xl">Organizador de Tarefas</h2>
          <p className="text-muted-foreground">
            Gerencie suas tarefas com filtros inteligentes e drag & drop
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Focus className="w-4 h-4" />
          <span className="text-sm">Modo Foco</span>
          <Switch checked={focusMode} onCheckedChange={setFocusMode} />
        </div>
      </div>

      {!focusMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filters.energy} onValueChange={(value) => updateFilter("energy", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Nível de Energia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta Energia</SelectItem>
                  <SelectItem value="medium">Média Energia</SelectItem>
                  <SelectItem value="low">Baixa Energia</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.timeRange} onValueChange={(value) => updateFilter("timeRange", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tempo Estimado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer</SelectItem>
                  <SelectItem value="0-15">0-15 min</SelectItem>
                  <SelectItem value="15-30">15-30 min</SelectItem>
                  <SelectItem value="30-60">30-60 min</SelectItem>
                  <SelectItem value="60-120">1-2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GripVertical className="w-5 h-5" />
            Tarefas Organizadas
            {focusMode && <Badge variant="secondary">Modo Foco</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, task.id)}
                className={`
                  p-4 border rounded-lg cursor-move hover:shadow-md transition-all
                  ${focusMode ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs">{task.energy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Timer className="w-4 h-4" />
                      <span>{task.estimatedTime}min</span>
                    </div>
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