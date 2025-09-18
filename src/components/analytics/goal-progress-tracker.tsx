"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useGoals } from "@/contexts/goal-context";
import { useMemo } from "react";

export function GoalProgressTracker() {
  const { goals } = useGoals();

  const goalAnalytics = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === "IN_PROGRESS");
    const completedGoals = goals.filter(g => g.status === "COMPLETED");
    const overdueGoals = activeGoals.filter(g => new Date(g.targetDate) < new Date());
    
    return {
      total: goals.length,
      active: activeGoals.length,
      completed: completedGoals.length,
      overdue: overdueGoals.length,
      completionRate: goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0,
      activeGoals: activeGoals.map(goal => {
        const now = new Date();
        const start = new Date(goal.createdAt);
        const end = new Date(goal.targetDate);
        const totalTime = end.getTime() - start.getTime();
        const elapsedTime = now.getTime() - start.getTime();
        const timeProgress = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
        const isOverdue = now > end;
        const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...goal,
          timeProgress,
          isOverdue,
          daysRemaining,
          urgency: daysRemaining <= 7 ? "high" : daysRemaining <= 30 ? "medium" : "low"
        };
      }).sort((a, b) => {
        if (a.urgency === "high" && b.urgency !== "high") return -1;
        if (b.urgency === "high" && a.urgency !== "high") return 1;
        return a.daysRemaining - b.daysRemaining;
      })
    };
  }, [goals]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-50 border-red-200 text-red-800";
      case "medium": return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default: return "bg-green-50 border-green-200 text-green-800";
    }
  };

  const getProgressColor = (progress: number, isOverdue: boolean) => {
    if (isOverdue) return "bg-red-500";
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Metas</p>
                <p className="text-2xl font-bold">{goalAnalytics.total}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold text-blue-600">{goalAnalytics.active}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{goalAnalytics.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-purple-600">
                  {goalAnalytics.completionRate.toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Metas Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goalAnalytics.activeGoals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta ativa no momento</p>
                <Button variant="outline" className="mt-4">
                  Criar Nova Meta
                </Button>
              </div>
            ) : (
              goalAnalytics.activeGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getUrgencyColor(goal.urgency)}>
                        {goal.urgency === "high" ? "Urgente" : 
                         goal.urgency === "medium" ? "Moderado" : "Baixo"}
                      </Badge>
                      {goal.isOverdue && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Atrasado
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso de Tempo</span>
                      <span>{goal.timeProgress.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={goal.timeProgress} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {goal.isOverdue 
                          ? `Atrasado há ${Math.abs(goal.daysRemaining)} dias`
                          : `${goal.daysRemaining} dias restantes`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{goal.priority}</Badge>
                      {goal.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {goalAnalytics.overdue > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">
                  Atenção: {goalAnalytics.overdue} meta(s) atrasada(s)
                </h4>
                <p className="text-sm text-red-600">
                  Revise suas metas e ajuste os prazos se necessário
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}